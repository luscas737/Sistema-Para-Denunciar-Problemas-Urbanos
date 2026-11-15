import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Obra } from './entities/obra.entity';
import { Exemplar } from './entities/exemplar.entity';
import { ExemplaresService } from './exemplares.service';
import { ExemplaresController } from './exemplares.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Obra, Exemplar])],
  providers: [ExemplaresService],
  controllers: [ExemplaresController],
})
export class ExemplaresModule {}