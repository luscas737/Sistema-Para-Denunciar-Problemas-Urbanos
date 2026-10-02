import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

export const HISTORICO_RECORDER = 'HISTORICO_RECORDER';

export interface RegistroHistorico {
  denunciaId: string;
  statusAnterior: string | null;
  statusAtual: string;
  alteradoPorId?: string | null;
  comentario?: string | null;
}

export interface HistoricoRecorder {
  registrar(registro: RegistroHistorico, gerenciador?: EntityManager): Promise<void>;
}

@Injectable()
export class HistoricoRecorderNulo implements HistoricoRecorder {
  async registrar(): Promise<void> {
    return;
  }
}
