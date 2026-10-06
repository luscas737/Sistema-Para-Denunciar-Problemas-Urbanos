import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DenunciasModule } from '../denuncias/denuncias.module';
import { SetoresModule } from '../setores/setores.module';
import { Atendente } from '../usuarios/entities/atendente.entity';
import { Administrador } from '../usuarios/entities/administrador.entity';
import { Encaminhamento } from './encaminhamento.entity';
import { EncaminhamentosController } from './encaminhamentos.controller';
import { EncaminhamentosService } from './encaminhamentos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Encaminhamento, Atendente, Administrador]),
    DenunciasModule,
    SetoresModule,
  ],
  controllers: [EncaminhamentosController],
  providers: [EncaminhamentosService],
})
export class EncaminhamentosModule {}
