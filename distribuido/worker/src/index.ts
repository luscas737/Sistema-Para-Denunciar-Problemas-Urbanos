import { logger } from './logger.ts';

const QUEUE_URL = process.env.QUEUE_URL ?? 'http://localhost:3002';
const FILA = process.env.FILA ?? 'denuncias.processamento';
const INTERVALO_MS = Number(process.env.INTERVALO_MS ?? 2000);

/** Montagem do payload para encaminhamento via API REST (simulação) */
async function processar(mensagem: unknown): Promise<void> {
  const dados: any = mensagem ?? {};
  const denunciaId = dados.denunciaId ?? 'desconhecido';
  const acao = dados.acao ?? 'processar';

  logger.info(`Processando denuncia=${denunciaId} acao=${acao}`, {
    denunciaId,
    acao,
  });

  // Simula trabalho assíncrono (ex.: notificar, encaminhar, gravar anexo)
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Simula falha aleatoria para demonstrar retry
  if (acao === 'falhar') {
    throw new Error('Falha simulada no processamento da denuncia');
  }

  logger.info(`Denuncia=${denunciaId} processada com sucesso`);
}

/** Consome a proxima mensagem da fila e a processa */
async function consumirUma(): Promise<void> {
  try {
    const resp = await fetch(`${QUEUE_URL}/q/${encodeURIComponent(FILA)}/consume`, {
      method: 'POST',
    });

    if (resp.status === 204) {
      logger.debug(`Nenhuma mensagem pendente na fila ${FILA}`);
      return;
    }

    if (!resp.ok) {
      logger.error(
        `Erro ao consumir: ${resp.status} ${resp.statusText}`,
      );
      return;
    }

    const mensagem = (await resp.json()) as any;
    logger.debug('Mensagem consumida', { id: mensagem.id, fila: mensagem.fila });

    try {
      await processar(mensagem.payload);
      // Confirma entregue
      await fetch(
        `${QUEUE_URL}/q/${encodeURIComponent(FILA)}/ack?id=${encodeURIComponent(mensagem.id)}`,
        { method: 'POST' },
      );
      logger.info(`Mensagem confirmada: ${mensagem.id}`, {
        id: mensagem.id,
      });
    } catch (err: any) {
      logger.error(
        `Falha ao processar mensagem ${mensagem.id}: ${err?.message ?? err}`,
        { id: mensagem.id, erro: err?.message ?? String(err) },
      );
      // Reenvia para pendente (retry) - tentativas podem ser contadas no payload
      await fetch(
        `${QUEUE_URL}/q/${encodeURIComponent(FILA)}/retry?id=${encodeURIComponent(mensagem.id)}`,
        { method: 'POST' },
      );
      logger.warn(`Mensagem retornou para pendente: ${mensagem.id}`, {
        id: mensagem.id,
      });
    }
  } catch (err: any) {
    logger.error(
      `Erro inesperado ao consumir: ${err?.message ?? err}`,
      { erro: err?.message ?? String(err) },
    );
  }
}

/** Loop principal de consumo */
async function loop(): Promise<void> {
  logger.info(`Iniciando consumidor da fila ${FILA} (intervalo ${INTERVALO_MS}ms)`, {
    fila: FILA,
    intervaloMs: INTERVALO_MS,
  });

  while (true) {
    await consumirUma();
    await new Promise((resolve) => setTimeout(resolve, INTERVALO_MS));
  }
}

process.on('SIGINT', () => {
  logger.info('Worker encerrando.');
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  logger.error(`Rejeicao nao tratada: ${err}`, { erro: err });
});

loop().catch((err) => {
  logger.error(`Erro fatal no loop: ${err}`, { erro: err });
  process.exit(1);
});
