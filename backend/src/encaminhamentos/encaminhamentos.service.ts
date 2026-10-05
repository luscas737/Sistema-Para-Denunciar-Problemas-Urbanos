import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { TipoUsuario } from '../common/tipos-usuario';
import { DenunciasService } from '../denuncias/denuncias.service';
import { StatusDenuncia } from '../denuncias/denuncia.enums';
import { SetoresService } from '../setores/setores.service';
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
    private readonly setores: SetoresService,
    private readonly denuncias: DenunciasService,
    private readonly dataSource: DataSource,
  ) {}

  async criar(
    denunciaId: string,
    dto: CriarEncaminhamentoDto,
    contexto: ContextoAtendimento,
  ): Promise<Encaminhamento> {
    // 1. Valida que a denúncia existe (delega para o DenunciasService)
    const denuncia = await this.denuncias.obterPorId(denunciaId);

    if (denuncia.arquivada) {
      throw new ConflictException('Denúncia arquivada não pode ser encaminhada.');
    }

    // 2. Valida que o setor existe e está ativo (delega para o SetoresService)
    await this.setores.obterAtivoParaEncaminhamento(dto.setorDestinoId);

    // 3. Regra: sem reencaminhamento ao mesmo setor (constraint 6 da seção 5.4)
    const jaEncaminhado = await this.encaminhamentos.findOne({
      where: { denunciaId, setorDestinoId: dto.setorDestinoId },
    });
    if (jaEncaminhado) {
      throw new ConflictException('Esta denúncia já foi encaminhada para este setor.');
    }

    // 4. Transação: cria o encaminhamento + muda o status para "encaminhada"
    return this.dataSource.transaction(async (gerenciador) => {
      const encaminhamento = gerenciador.create(Encaminhamento, {
        denunciaId,
        setorDestinoId: dto.setorDestinoId,
        enviadoPorId: contexto.usuarioId,
        observacao: dto.observacao?.trim() ?? null,
        aceite: null,
      });
      const salvo = await gerenciador.save(Encaminhamento, encaminhamento);

      // Atualiza o setorAtualId da denúncia e, se o status atual for "recebida",
      // dispara a transição válida para "encaminhada" via DenunciasService.
      await gerenciador.update(
        'denuncias',
        { id: denunciaId },
        { setorAtualId: dto.setorDestinoId },
      );

      if (denuncia.status === StatusDenuncia.RECEBIDA) {
        await this.denuncias.alterarStatus(
          denunciaId,
          { status: StatusDenuncia.ENCAMINHADA, comentario: dto.observacao ?? null },
          { tipo: contexto.tipo, usuarioId: contexto.usuarioId },
        );
      }

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
}
