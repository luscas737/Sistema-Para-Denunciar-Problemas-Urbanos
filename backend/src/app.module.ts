import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DenunciasModule } from './denuncias/denuncias.module';
import { SetoresModule } from './setores/setores.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { opcoesBanco } from './database/data-source';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...opcoesBanco,
      migrationsRun: true,
    }),
    DenunciasModule,
    SetoresModule,
    UsuariosModule,
  ],
})
export class AppModule {}
