import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Anexo } from '../anexos/entities/anexo.entity';
import { Denuncia } from '../denuncias/entities/denuncia.entity';
import { Encaminhamento } from '../encaminhamentos/encaminhamento.entity';
import { HistoricoStatusController } from './historico-status.controller';
import { HistoricoStatusService } from './historico-status.service';
import { HistoricoStatus } from './entities/historico-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HistoricoStatus, Denuncia, Encaminhamento, Anexo])],
  controllers: [HistoricoStatusController],
  providers: [HistoricoStatusService],
  exports: [HistoricoStatusService],
})
export class HistoricoStatusModule {}