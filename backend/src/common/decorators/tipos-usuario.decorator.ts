import { SetMetadata } from '@nestjs/common';
import { TipoUsuario } from '../tipos-usuario';

export const TIPOS_PERMITIDOS_KEY = 'tiposPermitidos';

export const TiposPermitidos = (...tipos: TipoUsuario[]) =>
  SetMetadata(TIPOS_PERMITIDOS_KEY, tipos);
