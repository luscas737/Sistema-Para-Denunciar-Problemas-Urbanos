import { Injectable } from '@nestjs/common';

export const HISTORICO_RECORDER = 'HISTORICO_RECORDER';

/** Dados gravados a cada mudança de status (contrato combinado com a P3 — decisão D7). */
export interface RegistroHistorico {
  denunciaId: string;
  statusAnterior: string | null;
  statusAtual: string;
  alteradoPorId?: string | null;
  comentario?: string | null;
}

export interface HistoricoRecorder {
  registrar(registro: RegistroHistorico): Promise<void>;
}

/**
 * Implementação provisória: não persiste nada enquanto a P3 não entregar o
 * HistoricoStatusService. A P3 substitui este provider pelo serviço real.
 */
@Injectable()
export class HistoricoRecorderNulo implements HistoricoRecorder {
  async registrar(): Promise<void> {
    return;
  }
}
