import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Denuncia } from '../denuncias/entities/denuncia.entity';
import { AnexosController } from './anexos.controller';
import { AnexosService } from './anexos.service';
import { Anexo } from './entities/anexo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Anexo, Denuncia])],
  controllers: [AnexosController],
  providers: [AnexosService],
  exports: [AnexosService],
})
export class AnexosModule {}