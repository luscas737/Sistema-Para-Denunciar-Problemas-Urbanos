import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DenunciasModule } from './denuncias/denuncias.module';
import { opcoesBanco } from './database/data-source';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...opcoesBanco,
      // Aplica as migrations pendentes ao subir a API (facilita o start.sh).
      migrationsRun: true,
    }),
    DenunciasModule,
  ],
})
export class AppModule {}
