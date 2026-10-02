import { TipoUsuario } from '../common/tipos-usuario';
import { CidadaoResponseDto, UsuarioResponseDto } from './dto/usuario.dto';
import { Cidadao } from './entities/cidadao.entity';
import { Usuario } from './entities/usuario.entity';

/**
 * O discriminador `tipo` não é uma propriedade mapeada na herança de tabela única,
 * então ele é derivado do subtipo. P2/P3 acrescentam os seus ramos aqui.
 */
export function tipoDe(usuario: Usuario): TipoUsuario {
  if (usuario instanceof Cidadao) return TipoUsuario.CIDADAO;
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
