import { Module } from '@nestjs/common';
import { FilaService } from './fila.service';

@Module({
  providers: [FilaService],
  exports: [FilaService],
})
export class FilaModule {}
