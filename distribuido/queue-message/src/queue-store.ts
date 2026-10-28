/**
 * queue-store.ts — Persistência do "bastidor" de mensageria.
 *
 * Armazena mensagens por fila no arquivo data/queue.json. Serviço autônomo
 * (não depende de Redis/MQ externo), usado para demonstrar o fluxo produtor
 * (API) -> fila -> consumidor (worker) em processos/maquinas distintos.
 */
import { mkdirSync, writeFileSync, readFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

export type StatusMensagem = 'pendente' | 'processando' | 'entregue';

export interface Mensagem {
  id: string;
  fila: string;
  payload: unknown;
  createdAt: number;
  status: StatusMensagem;
}

export interface Store {
  mensagens: Mensagem[];
}

export class QueueStore {
  private readonly pasta: string;
  private readonly arquivo: string;
  private dados: Store = { mensagens: [] };
  private escritaProgramada: NodeJS.Timeout | null = null;

  constructor(pasta: string) {
    this.pasta = pasta;
    this.arquivo = join(pasta, 'queue.json');
    mkdirSync(pasta, { recursive: true });
    this.carregarOuInicializar();
  }

  private carregarOuInicializar(): void {
    try {
      const raw = readFileSync(this.arquivo, 'utf-8');
      this.dados = JSON.parse(raw) as Store;
      if (!Array.isArray(this.dados.mensagens)) this.dados.mensagens = [];
    } catch (err: any) {
      if (err.code !== 'ENOENT') {
        console.error('[queue-store] Falha ao ler o arquivo, reiniciando:', err.message);
      }
      this.dados = { mensagens: [] };
    }
  }

  private salvarComSeguranca(): void {
    // garante que a pasta existe (pode ter sido removida apos a inicializacao)
    mkdirSync(this.pasta, { recursive: true });
    const tmp = this.arquivo + '.tmp';
    try {
      writeFileSync(tmp, JSON.stringify(this.dados, null, 2), 'utf-8');
      renameSync(tmp, this.arquivo);
    } catch (err) {
      console.error('[queue-store] Falha ao salvar:', err && err.message ? err.message : String(err));
    }
  }

  private agendarEscrita(): void {
    if (this.escritaProgramada) return;
    this.escritaProgramada = setInterval(() => {
      this.salvarComSeguranca();
    }, 1500);
  }

  /** Enfileira uma mensagem. Chamado pelo produtor (API). */
  enqueue(fila: string, payload: unknown): Mensagem {
    const msg: Mensagem = {
      id: randomUUID(),
      fila,
      payload,
      createdAt: Date.now(),
      status: 'pendente',
    };
    this.dados.mensagens.push(msg);
    this.agendarEscrita();
    return msg;
  }

  /** Recupera mensagens pendentes de uma fila, a partir do ultimo id lido */
  listPendentes(fila: string, sinceId: string | null): Mensagem[] {
    const inicio = sinceId ? this.dados.mensagens.findIndex((m) => m.id === sinceId) + 1 : 0;
    return this.dados.mensagens.filter(
      (m) => m.fila === fila && m.status === 'pendente' && (inicio === 0 || m.id > sinceId),
    );
  }

  /** Marca mensagem como "em processamento" (bloqueia re-consumo) */
  marcarProcessando(id: string): boolean {
    const msg = this.dados.mensagens.find((m) => m.id === id);
    if (!msg || msg.status !== 'pendente') return false;
    msg.status = 'processando';
    this.agendarEscrita();
    return true;
  }

  /**
   * Reserva a proxima mensagem pendente da fila para consumo.
   * Atomico: move de 'pendente' -> 'processando' e devolve a mensagem.
   */
  consumerNext(fila: string): Mensagem | null {
    const i = this.dados.mensagens.findIndex(
      (m) => m.fila === fila && m.status === 'pendente',
    );
    if (i === -1) return null;
    const msg = this.dados.mensagens[i];
    msg.status = 'processando';
    this.agendarEscrita();
    return msg;
  }

  /** Confirma entrega (apenas se estiver processando) */
  marcarEntregue(id: string): boolean {
    const msg = this.dados.mensagens.find((m) => m.id === id);
    if (!msg || msg.status !== 'processando') return false;
    msg.status = 'entregue';
    this.agendarEscrita();
    return true;
  }

  /** Volta para pendente em caso de falha */
  retry(id: string): boolean {
    const msg = this.dados.mensagens.find((m) => m.id === id);
    if (!msg || msg.status !== 'processando') return false;
    msg.status = 'pendente';
    this.agendarEscrita();
    return true;
  }

  /** Envia para fila de erro */
  meterEmErro(id: string, causa: string): boolean {
    const msg = this.dados.mensagens.find((m) => m.id === id);
    if (!msg) return false;
    msg.status = 'pendente';
    msg.payload = {
      ...msg.payload,
      $erro: causa,
      $tentativas: (msg.payload as any)?.$tentativas ?? 0,
    };
    this.agendarEscrita();
    return true;
  }

  quantidadePendente(fila: string): number {
    return this.dados.mensagens.filter((m) => m.fila === fila && m.status === 'pendente').length;
  }

  limpar(): void {
    this.dados = { mensagens: [] };
    this.salvarComSeguranca();
  }
}
