import { SetMetadata } from '@nestjs/common';
import { TipoUsuario } from '../tipos-usuario';

export const TIPOS_PERMITIDOS_KEY = 'tiposPermitidos';

/** Restringe a rota aos tipos de usuário informados (lidos do header `x-tipo-usuario`). */
export const TiposPermitidos = (...tipos: TipoUsuario[]) =>
  SetMetadata(TIPOS_PERMITIDOS_KEY, tipos);
