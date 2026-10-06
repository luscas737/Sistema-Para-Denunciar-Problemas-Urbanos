import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { TipoUsuario } from '../common/tipos-usuario';
import { DenunciasService } from '../denuncias/denuncias.service';
import { StatusDenuncia } from '../denuncias/denuncia.enums';
import { SetoresService } from '../setores/setores.service';
import { Administrador } from '../usuarios/entities/administrador.entity';
import { Atendente } from '../usuarios/entities/atendente.entity';
import {
  CriarEncaminhamentoDto,
  ListarEncaminhamentosQueryDto,
} from './dto/encaminhamento.dto';
import { Encaminhamento } from './encaminhamento.entity';

export interface ContextoAtendimento {
  usuarioId: string;
  tipo: TipoUsuario;
}

@Injectable()
export class EncaminhamentosService {
  constructor(
    @InjectRepository(Encaminhamento)
    private readonly encaminhamentos: Repository<Encaminhamento>,
    @InjectRepository(Atendente)
    private readonly atendentes: Repository<Atendente>,
    @InjectRepository(Administrador)
    private readonly administradores: Repository<Administrador>,
    private readonly setores: SetoresService,
    private readonly denuncias: DenunciasService,
    private readonly dataSource: DataSource,
  ) {}

  async criar(
    denunciaId: string,
    dto: CriarEncaminhamentoDto,
    contexto: ContextoAtendimento,
  ): Promise<Encaminhamento> {
    // 1. A denúncia existe, não está arquivada e não está em estado final
    const denuncia = await this.denuncias.obterPorId(denunciaId);

    if (denuncia.arquivada) {
      throw new ConflictException('Denúncia arquivada não pode ser encaminhada.');
    }

    if (denuncia.status === StatusDenuncia.RESOLVIDA) {
      throw new ConflictException(
        'Denúncia resolvida está em estado final; reabra antes de encaminhar novamente.',
      );
    }

    // 2. Quem encaminha precisa ser um atendente ativo (seção 5.2 / 7.2 do planejamento)
    await this.validarEnviadoPor(contexto);

    // 3. O setor de destino existe e está ativo (seção 6.4)
    await this.setores.obterAtivoParaEncaminhamento(dto.setorDestinoId);

    // 4. Sem reencaminhamento ao mesmo setor (constraint 6 da seção 5.4)
    const jaEncaminhado = await this.encaminhamentos.findOne({
      where: { denunciaId, setorDestinoId: dto.setorDestinoId },
    });
    if (jaEncaminhado) {
      throw new ConflictException('Esta denúncia já foi encaminhada para este setor.');
    }

    // 5. Transação única (seção 7.2): encaminhamento + setorAtualId + transição de
    //    status recebida -> encaminhada acontecem juntos ou não acontecem.
    return this.dataSource.transaction(async (gerenciador) => {
      const encaminhamento = gerenciador.create(Encaminhamento, {
        denunciaId,
        setorDestinoId: dto.setorDestinoId,
        enviadoPorId: contexto.usuarioId,
        observacao: dto.observacao?.trim() ?? null,
        aceite: null,
      });
      const salvo = await gerenciador.save(Encaminhamento, encaminhamento);

      if (denuncia.status === StatusDenuncia.RECEBIDA) {
        // Passa o mesmo gerenciador: a transição (e a exigência de encaminhamento
        // dela) enxerga o recém-criado acima, tudo na mesma transação.
        await this.denuncias.alterarStatus(
          denunciaId,
          { status: StatusDenuncia.ENCAMINHADA, comentario: dto.observacao ?? null },
          { tipo: contexto.tipo, usuarioId: contexto.usuarioId },
          gerenciador,
        );
      }

      // Depois da transição, para que o save do status não sobrescreva o setor.
      await gerenciador.update(
        'denuncias',
        { id: denunciaId },
        { setorAtualId: dto.setorDestinoId },
      );

      return salvo;
    });
  }

  async listarPorDenuncia(
    denunciaId: string,
    filtros: ListarEncaminhamentosQueryDto,
  ): Promise<{ itens: Encaminhamento[]; total: number }> {
    // Garante que a denúncia existe (404 cedo, não lista vazia silenciosa)
    await this.denuncias.obterPorId(denunciaId);

    const where: FindOptionsWhere<Encaminhamento> = { denunciaId };
    const [itens, total] = await this.encaminhamentos.findAndCount({
      where,
      order: { dataEncaminhamento: 'ASC' },
      skip: (filtros.pagina - 1) * filtros.limite,
      take: filtros.limite,
    });

    return { itens, total };
  }

  async registrarAceite(id: string): Promise<Encaminhamento> {
    const encaminhamento = await this.obterPorId(id);
    if (encaminhamento.aceite) {
      throw new ConflictException('Este encaminhamento já foi aceito.');
    }
    encaminhamento.aceite = new Date();
    return this.encaminhamentos.save(encaminhamento);
  }

  async obterPorId(id: string): Promise<Encaminhamento> {
    const encaminhamento = await this.encaminhamentos.findOneBy({ id });
    if (!encaminhamento) {
      throw new NotFoundException(`Encaminhamento com id ${id} não encontrado.`);
    }
    return encaminhamento;
  }

  /**
   * Regra da seção 5.2: `enviadoPorId` precisa ser Atendente ou Administrador
   * ativo (o contrato da rota permite os dois papéis). O filtro por subtipo do
   * `@ChildEntity` já descarta cidadãos.
   */
  private async validarEnviadoPor(contexto: ContextoAtendimento): Promise<void> {
    if (!contexto.usuarioId) {
      throw new BadRequestException(
        'Informe o cabeçalho x-usuario-id com o id do atendente que está encaminhando.',
      );
    }

    const atendente = await this.atendentes.findOneBy({ id: contexto.usuarioId });
    if (atendente) {
      if (!atendente.ativo) {
        throw new ForbiddenException(
          'O encaminhamento precisa ser registrado por um atendente ativo.',
        );
      }
      return;
    }

    const administrador = await this.administradores.findOneBy({ id: contexto.usuarioId });
    if (!administrador || !administrador.ativo) {
      throw new ForbiddenException(
        'O encaminhamento precisa ser registrado por um atendente ou administrador ativo.',
      );
    }
  }
}
