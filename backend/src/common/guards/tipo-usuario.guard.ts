import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { TipoUsuario } from '../tipos-usuario';
import { TIPOS_PERMITIDOS_KEY } from '../decorators/tipos-usuario.decorator';

export const CABECALHO_TIPO_USUARIO = 'x-tipo-usuario';

/**
 * Autorização simplificada do MVP (decisão D5): o tipo do usuário vem do header
 * `x-tipo-usuario`, com `cidadao` como padrão. O JWT entra em uma etapa posterior.
 */
@Injectable()
export class TipoUsuarioGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(contexto: ExecutionContext): boolean {
    const permitidos = this.reflector.getAllAndOverride<TipoUsuario[]>(TIPOS_PERMITIDOS_KEY, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (!permitidos || permitidos.length === 0) return true;

    const requisicao = contexto.switchToHttp().getRequest<Request>();
    const valor = requisicao.headers[CABECALHO_TIPO_USUARIO];
    const tipo = (Array.isArray(valor) ? valor[0] : valor) ?? TipoUsuario.CIDADAO;

    if (!permitidos.includes(tipo as TipoUsuario)) {
      throw new ForbiddenException({
        message: `Acesso permitido apenas para: ${permitidos.join(', ')}.`,
      });
    }
    return true;
  }
}
