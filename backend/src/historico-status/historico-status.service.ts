import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  HistoricoRecorder,
  RegistroHistorico,
} from '../common/historico/historico-recorder';
import { StatusDenuncia } from '../denuncias/denuncia.enums';
import { Denuncia } from '../denuncias/entities/denuncia.entity';
import { Encaminhamento } from '../encaminhamentos/encaminhamento.entity';
import { tipoDe } from '../usuarios/usuarios.mapper';
import { Anexo } from '../anexos/entities/anexo.entity';
import { EventoLinhaTempoDto, LinhaDoTempoResponseDto } from './dto/historico.dto';
import { HistoricoStatus } from './entities/historico-status.entity';

@Injectable()
export class HistoricoStatusService implements HistoricoRecorder {
  constructor(
    @InjectRepository(HistoricoStatus)
    private readonly historicos: Repository<HistoricoStatus>,
    @InjectRepository(Denuncia)
    private readonly denuncias: Repository<Denuncia>,
    @InjectRepository(Encaminhamento)
    private readonly encaminhamentos: Repository<Encaminhamento>,
    @InjectRepository(Anexo)
    private readonly anexos: Repository<Anexo>,
  ) {}

  /**
   * D7: gravado pelo fluxo de mudança de status, na mesma transação (recebe o
   * `EntityManager` da transação de origem quando houver).
   */
  async registrar(registro: RegistroHistorico, gerenciador?: EntityManager): Promise<void> {
    if (
      registro.statusAnterior !== null &&
      registro.statusAnterior !== undefined &&
      registro.statusAnterior === registro.statusAtual
    ) {
      throw new BadRequestException('O histórico exige uma mudança real de status.');
    }

    const linha: Omit<HistoricoStatus, 'id' | 'dataAlteracao' | 'denuncia' | 'alteradoPor'> = {
      denunciaId: registro.denunciaId,
      statusAnterior: (registro.statusAnterior as StatusDenuncia | null) ?? null,
      statusAtual: registro.statusAtual as StatusDenuncia,
      alteradoPorId: registro.alteradoPorId ?? null,
      comentario: registro.comentario ?? null,
    };

    if (gerenciador) {
      await gerenciador.save(HistoricoStatus, gerenciador.create(HistoricoStatus, linha));
      return;
    }
    await this.historicos.save(this.historicos.create(linha));
  }

  async listarPorDenuncia(denunciaId: string): Promise<HistoricoStatus[]> {
    await this.garantirDenuncia(denunciaId);
    return this.historicos.find({
      where: { denunciaId },
      relations: { alteradoPor: true },
      order: { dataAlteracao: 'ASC' },
    });
  }

  /**
   * D8: linha do tempo é read model — junta `HistoricoStatus` + `Encaminhamento`
   * + `Anexo` ordenados por data crescente (seção 5.6).
   */
  async linhaDoTempo(denunciaId: string): Promise<LinhaDoTempoResponseDto> {
    const denuncia = await this.garantirDenuncia(denunciaId);

    const [historicos, encaminhamentos, anexos] = await Promise.all([
      this.historicos.find({
        where: { denunciaId },
        relations: { alteradoPor: true },
      }),
      this.encaminhamentos.find({
        where: { denunciaId },
        relations: { setorDestino: true, enviadoPor: true },
      }),
      this.anexos.find({ where: { denunciaId }, relations: { enviadoPor: true } }),
    ]);

    const eventos: EventoLinhaTempoDto[] = [
      ...historicos.map((h) => ({
        tipo: 'status' as const,
        de: h.statusAnterior,
        para: h.statusAtual,
        em: h.dataAlteracao,
        por: h.alteradoPor ? tipoDe(h.alteradoPor) : null,
        comentario: h.comentario,
      })),
      ...encaminhamentos.map((e) => ({
        tipo: 'encaminhamento' as const,
        em: e.dataEncaminhamento,
        por: e.enviadoPor ? tipoDe(e.enviadoPor) : null,
        setor: e.setorDestino?.nome ?? null,
        observacao: e.observacao,
      })),
      ...anexos.map((a) => ({
        tipo: 'anexo' as const,
        em: a.criadoEm,
        por: a.enviadoPor ? tipoDe(a.enviadoPor) : null,
        url: a.url,
        descricao: a.descricao,
      })),
    ].sort((a, b) => a.em.getTime() - b.em.getTime());

    return { denunciaId, statusAtual: denuncia.status, eventos };
  }

  private async garantirDenuncia(denunciaId: string): Promise<Denuncia> {
    const denuncia = await this.denuncias.findOneBy({ id: denunciaId });
    if (!denuncia) {
      throw new NotFoundException(`Denúncia com id ${denunciaId} não encontrada.`);
    }
    return denuncia;
  }
}