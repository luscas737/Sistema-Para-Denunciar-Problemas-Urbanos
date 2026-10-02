import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Like, Repository } from 'typeorm';
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
import { Denuncia } from './entities/denuncia.entity';
import { localizarTransicao, transicoesPossiveis } from './status.transicoes';

export interface ResultadoListagem {
  itens: Denuncia[];
  total: number;
}

/** Quem está executando a ação (tipo e id vêm dos headers `x-tipo-usuario` e `x-usuario-id`). */
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
    return this.denuncias.save(denuncia);
  }

  /**
   * Listagem com filtros (status, categoria, setor), busca textual e paginação.
   * Arquivadas ficam fora por padrão; `?arquivadas=true` libera todas (seção 6.4).
   */
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

  /** Usado pelo mapa: mesmos filtros, sem paginação (precisa de todos os pontos). */
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

  /** O status não é alterado aqui: isso passa pela máquina de estados (PATCH /:id/status). */
  async atualizar(id: string, dto: AtualizarDenunciaDto): Promise<Denuncia> {
    const denuncia = await this.obterPorId(id);

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

  /** Decisão D2: arquivar em vez de excluir, para não perder histórico. */
  async arquivar(id: string): Promise<Denuncia> {
    const denuncia = await this.obterPorId(id);
    if (denuncia.arquivada) return denuncia;

    denuncia.arquivada = true;
    denuncia.arquivadaEm = new Date();
    return this.denuncias.save(denuncia);
  }

  /**
   * Máquina de estados da seção 6.2: valida a transição, o tipo de usuário e as
   * pré-condições, e grava a mudança junto com o histórico (decisão D7).
   */
  async alterarStatus(
    id: string,
    dto: AtualizarStatusDto,
    contexto: ContextoAtuacao,
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

    // TODO(P2): ao entrar em `encaminhada`, exigir um Encaminhamento existente para o setor.

    const statusAnterior = denuncia.status;
    const comentario = dto.comentario?.trim() || null;

    return this.dataSource.transaction(async (gerenciador) => {
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
    });
  }

  private async garantirCidadaoAtivo(cidadaoId: string): Promise<void> {
    const existentes = await this.cidadaos.count({ where: { id: cidadaoId, ativo: true } });
    if (existentes === 0) {
      throw new BadRequestException('O cidadão informado não existe ou está inativo.');
    }
  }
}
