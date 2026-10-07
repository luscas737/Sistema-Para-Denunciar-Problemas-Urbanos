import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { opcoesBanco } from './database/data-source';
import { AnexosModule } from './anexos/anexos.module';
import { DenunciasModule } from './denuncias/denuncias.module';
<<<<<<< Updated upstream
import { SetoresModule } from './setores/setores.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { opcoesBanco } from './database/data-source';
import { EncaminhamentosModule } from './encaminhamentos/encaminhamentos.module';
import { AnexosModule } from './anexos/anexos.module';
import { HistoricoStatusModule } from './historico-status/historico-status.module';
=======
import { EncaminhamentosModule } from './encaminhamentos/encaminhamentos.module';
import { HistoricoStatusModule } from './historico-status/historico-status.module';
import { SetoresModule } from './setores/setores.module';
import { UsuariosModule } from './usuarios/usuarios.module';
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
    AnexosModule,
    HistoricoStatusModule,
=======
    HistoricoStatusModule,
    AnexosModule,
>>>>>>> Stashed changes
  ],
})
export class AppModule {}
