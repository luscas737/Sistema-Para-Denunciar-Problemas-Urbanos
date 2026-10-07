import { TipoUsuario } from '../common/tipos-usuario';
import {
  AdministradorResponseDto,
  AtendenteResponseDto,
  CidadaoResponseDto,
  UsuarioResponseDto,
} from './dto/usuario.dto';
import { Administrador } from './entities/administrador.entity';
import { Atendente } from './entities/atendente.entity';
import { Cidadao } from './entities/cidadao.entity';
import { Usuario } from './entities/usuario.entity';

export function tipoDe(usuario: Usuario): TipoUsuario {
  if (usuario instanceof Administrador) return TipoUsuario.ADMINISTRADOR;
  if (usuario instanceof Atendente) return TipoUsuario.ATENDENTE;
  if (usuario instanceof Cidadao) return TipoUsuario.CIDADAO;
  // Sem subtipo registrado não há como afirmar o papel (a base não existe: todo usuário é subtipo).
  return TipoUsuario.CIDADAO;
}

export function paraUsuarioDto(usuario: Usuario): UsuarioResponseDto {
  return {
    id: usuario.id,
    tipo: tipoDe(usuario),
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone,
    ativo: usuario.ativo,
    criadoEm: usuario.criadoEm,
    atualizadoEm: usuario.atualizadoEm,
  };
}

export function paraCidadaoDto(cidadao: Cidadao): CidadaoResponseDto {
  return {
    ...paraUsuarioDto(cidadao),
    tipo: TipoUsuario.CIDADAO,
    cpf: cidadao.cpf,
    bairro: cidadao.bairro,
  };
}

export function paraAtendenteDto(atendente: Atendente): AtendenteResponseDto {
  return {
    ...paraUsuarioDto(atendente),
    tipo: TipoUsuario.ATENDENTE,
    matricula: atendente.matricula,
    setorId: atendente.setorId,
  };
}

export function paraAdministradorDto(admin: Administrador): AdministradorResponseDto {
  return {
    ...paraUsuarioDto(admin),
    tipo: TipoUsuario.ADMINISTRADOR,
    nivelAcesso: admin.nivelAcesso,
  };
}
