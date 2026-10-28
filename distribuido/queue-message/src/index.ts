import http from 'node:http';
import type { LogEntry } from './logger.ts';
import { QueueStore } from './queue-store.ts';
import { FILAS, logger } from './logger.ts';

export interface MensagemHttp {
  fila: string;
  payload: unknown;
}

const port = Number(process.env.PORT ?? 3002);
const store = new QueueStore(process.env.DATA_DIR ?? process.cwd() + '/data');

const server = http.createServer(async (req, res) => {
  const log: LogEntry = { nivel: 'debug', mensagem: `${req.method} ${req.url}`, timestamp: Date.now() };
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'POST' && url.pathname === '/q') {
      const body: MensagemHttp = await leBody(req);
      if (!body.fila) throw new ErroHttp(400, 'Campo "fila" obrigatório.');
      if (!body.payload) throw new ErroHttp(400, 'Campo "payload" obrigatório.');
      const msg = store.enqueue(body.fila, body.payload);
      logger.info(`Mensagem enfileirada: ${msg.id} (fila: ${msg.fila})`, { id: msg.id, fila: msg.fila });
      res.writeHead(201).end(JSON.stringify({ id: msg.id, fila: msg.fila, at: msg.createdAt }));
      return;
    }

    const match = url.pathname.match(/^\/q\/([^/]+)\/?(.*)$/);
    if (match) {
      const fila = decodeURIComponent(match[1]);
      if (req.method === 'GET' && !match[2]) {
        const since = url.searchParams.get('since') ?? null;
        const pendentes = store.listPendentes(fila, since);
        res.writeHead(200).end(JSON.stringify({ fila, mensagens: pendentes, desde: since }));
        return;
      }
      // Consumer (worker) reivindica a proxima mensagem pendente da fila.
      // Atomico: pendente -> processando.
      if (req.method === 'POST' && match[2] === 'consume') {
        const msg = store.consumerNext(fila);
        if (!msg) {
          res.writeHead(204).end();
          return;
        }
        logger.debug(`Mensagem consumida: ${msg.id} (fila: ${fila})`, { id: msg.id, fila });
        res.writeHead(200).end(JSON.stringify(msg));
        return;
      }
      if (req.method === 'POST' && match[2] === 'ack') {
        const id = url.searchParams.get('id');
        if (!id) throw new ErroHttp(400, 'id via query (id) obrigatório.');
        if (!store.marcarEntregue(id)) throw new ErroHttp(409, 'Mensagem não está em processamento.');
        logger.info(`Mensagem entregue: ${id}`, { id, fila });
        res.writeHead(200).end(JSON.stringify({ ok: true }));
        return;
      }
      if (req.method === 'POST' && match[2] === 'retry') {
        const id = url.searchParams.get('id');
        if (!id) throw new ErroHttp(400, 'id via query (id) obrigatório.');
        if (!store.retry(id)) throw new ErroHttp(409, 'Mensagem não está processando.');
        logger.warn(`Mensagem retornou para pendente: ${id}`, { id, fila });
        res.writeHead(200).end(JSON.stringify({ ok: true }));
        return;
      }
    }

    res.writeHead(404).end(JSON.stringify({ erro: 'Não encontrado' }));
  } catch (err: any) {
    const erro = err instanceof ErroHttp ? err : new ErroHttp(500, 'Erro interno do servidor de filas');
    log.nivel = 'error';
    log.mensagem = `${req.method} ${req.url} -> ${erro.status} ${erro.message}`;
    log.dados = err;
    res.writeHead(erro.status).end(JSON.stringify({ erro: erro.message, detalhe: erro.detalhe ?? undefined }));
  }
});

server.listen(port, () => {
  logger.info(`Serviço de filas ouvindo na porta ${port}`, { port });
});

process.on('SIGINT', () => {
  logger.info('Serviço de filas encerrando.');
  store.limpar();
  server.close(() => process.exit(0));
});

class ErroHttp extends Error {
  public status: number;
  public detalhe?: string;

  constructor(status: number, message: string, detalhe?: string) {
    super(message);
    this.status = status;
    this.detalhe = detalhe;
  }
}

async function leBody(req: http.IncomingMessage): Promise<MensagemHttp> {
  return new Promise((resolve, reject) => {
    let dados = '';
    req.on('data', (chunk) => {
      dados += chunk;
      if (dados.length > 1_000_000) {
        reject(new ErroHttp(413, 'Corpo muito grande.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(dados));
      } catch {
        reject(new ErroHttp(400, 'Corpo deve ser JSON válido.'));
      }
    });
    req.on('error', reject);
  });
}
