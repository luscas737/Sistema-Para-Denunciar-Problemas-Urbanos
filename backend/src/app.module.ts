import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DenunciasModule } from './denuncias/denuncias.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { opcoesBanco } from './database/data-source';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...opcoesBanco,
      migrationsRun: true,
    }),
    DenunciasModule,
    UsuariosModule,
  ],
})
export class AppModule {}
