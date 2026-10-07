import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DenunciasModule } from './denuncias/denuncias.module';
import { SetoresModule } from './setores/setores.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { opcoesBanco } from './database/data-source';
import { EncaminhamentosModule } from './encaminhamentos/encaminhamentos.module';
import { AnexosModule } from './anexos/anexos.module';
import { HistoricoStatusModule } from './historico-status/historico-status.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...opcoesBanco,
      migrationsRun: true,
    }),
    DenunciasModule,
    SetoresModule,
    UsuariosModule,
    EncaminhamentosModule,
    AnexosModule,
    HistoricoStatusModule,
  ],
})
export class AppModule {}
