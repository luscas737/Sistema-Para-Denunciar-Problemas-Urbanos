import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Denuncia } from './entities/denuncia.entity';
import { DenunciasController } from './denuncias.controller';
import { DenunciasService } from './denuncias.service';

@Module({
  imports: [TypeOrmModule.forFeature([Denuncia])],
  controllers: [DenunciasController],
  providers: [DenunciasService],
})
export class DenunciasModule {}
