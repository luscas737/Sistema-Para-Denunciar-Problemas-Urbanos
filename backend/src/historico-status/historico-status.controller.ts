import { Controller, Get, Param } from '@nestjs/common';
import { HistoricoStatusService } from './historico-status.service';

@Controller('api/denuncias/:id')
export class HistoricoStatusController {
  constructor(
    private readonly historicoStatusService: HistoricoStatusService,
  ) {}

  @Get('historico')
  listarHistorico(@Param('id') id: string) {
    return this.historicoStatusService.listarHistorico(id);
  }

  @Get('linha-do-tempo')
  linhaDoTempo(@Param('id') id: string) {
    return this.historicoStatusService.listarHistorico(id);
  }
}