import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setor } from './setores.entity';
import { SetoresController } from './setores.controller';
import { SetoresService } from './setores.service';

@Module({
  imports: [TypeOrmModule.forFeature([Setor])],
  controllers: [SetoresController],
  providers: [SetoresService],
  exports: [SetoresService],
})
export class SetoresModule {}
