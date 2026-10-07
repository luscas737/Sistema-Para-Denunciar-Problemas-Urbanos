import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, FindOptionsWhere, Like, Repository } from 'typeorm';
import { HISTORICO_RECORDER, HistoricoRecorder } from '../common/historico/historico-recorder';
import { TipoUsuario } from '../common/tipos-usuario';
import { Cidadao } from '../usuarios/entities/cidadao.entity';
import {
  AtualizarDenunciaDto,
  AtualizarStatusDto,
  CriarDenunciaDto,
  ListarDenunciasQueryDto,
} from './dto/denuncia.dto';
import { StatusDenuncia } from './denuncia.enums';
import { Encaminhamento } from '../encaminhamentos/encaminhamento.entity';
import { Denuncia } from './entities/denuncia.entity';
import { localizarTransicao, transicoesPossiveis } from './status.transicoes';

export interface ResultadoListagem {
  itens: Denuncia[];
  total: number;
}

export interface ContextoAtuacao {
  tipo: TipoUsuario;
  usuarioId?: string | null;
}

@Injectable()
export class DenunciasService {
  constructor(
    @InjectRepository(Denuncia)
    private readonly denuncias: Repository<Denuncia>,
    @InjectRepository(Cidadao)
    private readonly cidadaos: Repository<Cidadao>,
    private readonly dataSource: DataSource,
    @Inject(HISTORICO_RECORDER)
    private readonly historico: HistoricoRecorder,
  ) {}

  async criar(dto: CriarDenunciaDto): Promise<Denuncia> {
    if (dto.cidadaoId) {
      await this.garantirCidadaoAtivo(dto.cidadaoId);
    }

    const denuncia = this.denuncias.create({
      titulo: dto.titulo.trim(),
      descricao: dto.descricao.trim(),
      categoria: dto.categoria,
      latitude: dto.latitude,
      longitude: dto.longitude,
      cidadaoId: dto.cidadaoId ?? null,
      setorAtualId: null,
      status: StatusDenuncia.RECEBIDA,
      arquivada: false,
      arquivadaEm: null,
    });

    // Seção 6.2: a criação grava a 1ª linha do histórico (statusAnterior = null),
    // na mesma transação (D7).
    return this.dataSource.transaction(async (gerenciador) => {
      const salva = await gerenciador.save(Denuncia, denuncia);
      await this.historico.registrar(
        {
          denunciaId: salva.id,
          statusAnterior: null,
          statusAtual: StatusDenuncia.RECEBIDA,
          alteradoPorId: dto.cidadaoId ?? null,
          comentario: null,
        },
        gerenciador,
      );
      return salva;
    });
  }

  async listar(filtros: ListarDenunciasQueryDto): Promise<ResultadoListagem> {
    const base: FindOptionsWhere<Denuncia> = {};
    if (!filtros.arquivadas) base.arquivada = false;
    if (filtros.status) base.status = filtros.status;
    if (filtros.categoria) base.categoria = filtros.categoria;
    if (filtros.setor) base.setorAtualId = filtros.setor;

    const where: FindOptionsWhere<Denuncia> | FindOptionsWhere<Denuncia>[] = filtros.busca
      ? [
          { ...base, titulo: Like(`%${filtros.busca}%`) },
          { ...base, descricao: Like(`%${filtros.busca}%`) },
        ]
      : base;

    const [itens, total] = await this.denuncias.findAndCount({
      where,
      order: { criadoEm: 'DESC' },
      skip: (filtros.pagina - 1) * filtros.limite,
      take: filtros.limite,
    });

    return { itens, total };
  }

  async listarParaMapa(filtros: ListarDenunciasQueryDto): Promise<Denuncia[]> {
    const where: FindOptionsWhere<Denuncia> = { arquivada: false };
    if (filtros.status) where.status = filtros.status;
    if (filtros.categoria) where.categoria = filtros.categoria;
    if (filtros.setor) where.setorAtualId = filtros.setor;

    return this.denuncias.find({ where, order: { criadoEm: 'DESC' } });
  }

  async obterPorId(id: string): Promise<Denuncia> {
    const denuncia = await this.denuncias.findOneBy({ id });
    if (!denuncia) {
      throw new NotFoundException(`Denúncia com id ${id} não encontrada.`);
    }
    return denuncia;
  }

  async atualizar(
    id: string,
    dto: AtualizarDenunciaDto,
    contexto: ContextoAtuacao = { tipo: TipoUsuario.CIDADAO },
  ): Promise<Denuncia> {
    const denuncia = await this.obterPorId(id);

    // Regra 6.3-1: o autor corrige até a prefeitura assumir; depois só atendente/administrador.
    const podeAposEncaminhar = [TipoUsuario.ATENDENTE, TipoUsuario.ADMINISTRADOR].includes(
      contexto.tipo,
    );
    if (denuncia.status !== StatusDenuncia.RECEBIDA && !podeAposEncaminhar) {
      throw new ConflictException(
        'Denúncia em atendimento não pode ser alterada por quem não é atendente ou administrador.',
      );
    }

    if (dto.cidadaoId) {
      await this.garantirCidadaoAtivo(dto.cidadaoId);
      denuncia.cidadaoId = dto.cidadaoId;
    }
    if (dto.titulo !== undefined) denuncia.titulo = dto.titulo.trim();
    if (dto.descricao !== undefined) denuncia.descricao = dto.descricao.trim();
    if (dto.categoria !== undefined) denuncia.categoria = dto.categoria;
    if (dto.latitude !== undefined) denuncia.latitude = dto.latitude;
    if (dto.longitude !== undefined) denuncia.longitude = dto.longitude;

    return this.denuncias.save(denuncia);
  }

  async arquivar(id: string): Promise<Denuncia> {
    const denuncia = await this.obterPorId(id);
    if (denuncia.arquivada) return denuncia;

    denuncia.arquivada = true;
    denuncia.arquivadaEm = new Date();
    return this.denuncias.save(denuncia);
  }

  async alterarStatus(
    id: string,
    dto: AtualizarStatusDto,
    contexto: ContextoAtuacao,
    gerenciadorExterno?: EntityManager,
  ): Promise<Denuncia> {
    const denuncia = await this.obterPorId(id);

    if (denuncia.arquivada) {
      throw new ConflictException('Denúncia arquivada não pode mudar de status.');
    }

    const transicao = localizarTransicao(denuncia.status, dto.status);
    if (!transicao) {
      const permitidas = transicoesPossiveis(denuncia.status);
      throw new ConflictException(
        permitidas.length > 0
          ? `Transição inválida de "${denuncia.status}" para "${dto.status}". A partir deste status só é possível ir para: ${permitidas.join(', ')}.`
          : `O status "${denuncia.status}" é final e não permite novas transições.`,
      );
    }

    if (!transicao.tiposPermitidos.includes(contexto.tipo)) {
      throw new ForbiddenException(
        `A transição "${transicao.descricao}" é permitida apenas para: ${transicao.tiposPermitidos.join(', ')}.`,
      );
    }

    if (transicao.exigeComentario && !dto.comentario?.trim()) {
      throw new BadRequestException('A reabertura da denúncia exige um comentário.');
    }

    if (transicao.exigeSetorAtual && !denuncia.setorAtualId) {
      throw new ConflictException(
        'A denúncia precisa estar vinculada a um setor para entrar em andamento.',
      );
    }

    const statusAnterior = denuncia.status;
    const comentario = dto.comentario?.trim() || null;
    const salvoId = denuncia.id;

    const executar = async (gerenciador: EntityManager): Promise<Denuncia> => {
      // Regra 6.2: recebida -> encaminhada exige um Encaminhamento registrado.
      // Contagem no mesmo gerenciador: quando chamado de dentro da transação do
      // POST /encaminhamentos, o recém-criado é visível (mesma transação).
      if (transicao.exigeEncaminhamento) {
        const total = await gerenciador.count(Encaminhamento, {
          where: { denunciaId: salvoId },
        });
        if (total === 0) {
          throw new ConflictException(
            'A denúncia precisa ter um encaminhamento registrado antes de mudar para "encaminhada".',
          );
        }
      }

      denuncia.status = dto.status;
      const salva = await gerenciador.save(Denuncia, denuncia);
      await this.historico.registrar(
        {
          denunciaId: salva.id,
          statusAnterior,
          statusAtual: dto.status,
          alteradoPorId: contexto.usuarioId ?? null,
          comentario,
        },
        gerenciador,
      );
      return salva;
    };

    return gerenciadorExterno ? executar(gerenciadorExterno) : this.dataSource.transaction(executar);
  }

  private async garantirCidadaoAtivo(cidadaoId: string): Promise<void> {
    const existentes = await this.cidadaos.count({ where: { id: cidadaoId, ativo: true } });
    if (existentes === 0) {
      throw new BadRequestException('O cidadão informado não existe ou está inativo.');
    }
  }
}
