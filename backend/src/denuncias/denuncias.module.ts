import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HISTORICO_RECORDER } from '../common/historico/historico-recorder';
import { HistoricoStatusModule } from '../historico-status/historico-status.module';
import { HistoricoStatusService } from '../historico-status/historico-status.service';
import { FilaModule } from '../fila/fila.module';
import { Cidadao } from '../usuarios/entities/cidadao.entity';
import { DenunciasController } from './denuncias.controller';
import { DenunciasService } from './denuncias.service';
import { Denuncia } from './entities/denuncia.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Denuncia, Cidadao]),
    HistoricoStatusModule,
    FilaModule,
  ],
  controllers: [DenunciasController],
  providers: [
    DenunciasService,
    // D7: quem grava o histórico é o fluxo de status, na mesma transação.
    { provide: HISTORICO_RECORDER, useExisting: HistoricoStatusService },
  ],
  exports: [DenunciasService],
})
export class DenunciasModule {}
