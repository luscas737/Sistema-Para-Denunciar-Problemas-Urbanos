/** Padrão de nomenclatura das filas. Centralizados para facilitar a troca */
export const FILAS = {
  DENUNCIAS_PROCESSAMENTO: 'denuncias.processamento',
} as const;

/** Nível de log padronizado */
export type LogNivel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  nivel: LogNivel;
  mensagem: string;
  dados?: unknown;
  timestamp: number;
}

export const NIVEIS: LogNivel[] = ['debug', 'info', 'warn', 'error'];

/** Instância de log compartilhada entre os serviços */
export const logger = {
  log(nivel: LogNivel, mensagem: string, dados?: unknown): void {
    const prefix = `[${new Date().toISOString()}] [${nivel.toUpperCase()}]`;
    const linha = `${prefix} ${mensagem}`;
    if (dados) {
      try {
        console.log(`${linha} ${JSON.stringify(dados)}`);
      } catch {
        console.log(linha);
      }
    } else {
      console.log(linha);
    }
  },
  info(m: string, d?: unknown): void { logger.log('info', m, d); },
  warn(m: string, d?: unknown): void { logger.log('warn', m, d); },
  error(m: string, d?: unknown): void { logger.log('error', m, d); },
  debug(m: string, d?: unknown): void { logger.log('debug', m, d); },
};
