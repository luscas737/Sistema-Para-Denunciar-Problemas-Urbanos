import { Injectable } from '@nestjs/common';

@Injectable()
export class HistoricoStatusService {
  private historicos: any[] = [];

  criarHistorico(historico: any) {
    this.historicos.push(historico);
    return historico;
  }

  listarHistorico(denunciaId: string) {
    return this.historicos.filter(
      (historico) => historico.denunciaId === denunciaId,
    );
  }
}