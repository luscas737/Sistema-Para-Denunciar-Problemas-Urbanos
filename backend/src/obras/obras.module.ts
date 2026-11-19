import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Autor } from './entities/autor.entity';
import { Obra } from './entities/obra.entity';
import { Exemplar } from './entities/exemplar.entity';
import { ObrasService } from './obras.service';
import { ObrasController } from './obras.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Autor, Obra, Exemplar])],
  providers: [ObrasService],
  controllers: [ObrasController],
})
export class ObrasModule {}