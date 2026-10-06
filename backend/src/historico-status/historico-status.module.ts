import { Module } from '@nestjs/common';
import { HistoricoStatusController } from './historico-status.controller';
import { HistoricoStatusService } from './historico-status.service';

@Module({
  controllers: [HistoricoStatusController],
  providers: [HistoricoStatusService],
})
export class HistoricoStatusModule {}