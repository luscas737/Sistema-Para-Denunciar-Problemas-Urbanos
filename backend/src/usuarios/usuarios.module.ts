import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetoresModule } from '../setores/setores.module';
import { AdministradoresController } from './administradores.controller';
import { AtendentesController } from './atendentes.controller';
import { CidadaosController } from './cidadaos.controller';
import { Administrador } from './entities/administrador.entity';
import { Atendente } from './entities/atendente.entity';
import { Cidadao } from './entities/cidadao.entity';
import { Usuario } from './entities/usuario.entity';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Cidadao, Atendente, Administrador]), SetoresModule],
  controllers: [CidadaosController, AtendentesController, AdministradoresController, UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
