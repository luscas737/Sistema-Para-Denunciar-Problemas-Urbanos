import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { opcoesBanco } from './database/data-source';
import { AnexosModule } from './anexos/anexos.module';
import { DenunciasModule } from './denuncias/denuncias.module';
import { EncaminhamentosModule } from './encaminhamentos/encaminhamentos.module';
import { HistoricoStatusModule } from './historico-status/historico-status.module';
import { SetoresModule } from './setores/setores.module';
import { UsuariosModule } from './usuarios/usuarios.module';

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
    HistoricoStatusModule,
    AnexosModule,
  ],
})
export class AppModule {}
