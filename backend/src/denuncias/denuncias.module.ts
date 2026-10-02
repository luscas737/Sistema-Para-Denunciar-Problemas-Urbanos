import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HISTORICO_RECORDER, HistoricoRecorderNulo } from '../common/historico/historico-recorder';
import { Cidadao } from '../usuarios/entities/cidadao.entity';
import { DenunciasController } from './denuncias.controller';
import { DenunciasService } from './denuncias.service';
import { Denuncia } from './entities/denuncia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Denuncia, Cidadao])],
  controllers: [DenunciasController],
  providers: [
    DenunciasService,
    { provide: HISTORICO_RECORDER, useClass: HistoricoRecorderNulo },
  ],
  exports: [DenunciasService],
})
export class DenunciasModule {}
