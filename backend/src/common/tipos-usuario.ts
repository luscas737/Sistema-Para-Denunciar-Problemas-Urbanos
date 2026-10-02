/**
 * Tipos de usuário do sistema (decisão D1 — herança de tabela única).
 * Os valores são exatamente os gravados na coluna discriminadora `tipo` da tabela `usuarios`.
 */
export enum TipoUsuario {
  CIDADAO = 'cidadao',
  ATENDENTE = 'atendente',
  ADMINISTRADOR = 'administrador',
}

export const TIPOS_USUARIO: TipoUsuario[] = [
  TipoUsuario.CIDADAO,
  TipoUsuario.ATENDENTE,
  TipoUsuario.ADMINISTRADOR,
];
