import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DenunciasModule } from '../denuncias/denuncias.module';
import { SetoresModule } from '../setores/setores.module';
import { Encaminhamento } from './encaminhamento.entity';
import { EncaminhamentosController } from './encaminhamentos.controller';
import { EncaminhamentosService } from './encaminhamentos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Encaminhamento]),
    DenunciasModule,
    SetoresModule,
  ],
  controllers: [EncaminhamentosController],
  providers: [EncaminhamentosService],
})
export class EncaminhamentosModule {}
