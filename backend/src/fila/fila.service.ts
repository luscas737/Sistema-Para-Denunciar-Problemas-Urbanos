import { Injectable, Logger } from '@nestjs/common';

/**
 * Serviço de enfileiramento de mensagens para o bastidor de mensageria
 * distribuído (distribuido/queue-message).
 *
 * O produtor (API) publica mensagens na fila e o worker as consome
 * de forma assíncrona. A publicação é não-bloqueante: se o serviço de
 * filas estiver indisponível, a operação principal (criação da denúncia)
 * não falha — apenas registra o erro no log.
 */
@Injectable()
export class FilaService {
  private readonly logger = new Logger(FilaService.name);
  private readonly filaUrl = process.env.FILA_URL ?? 'http://localhost:3002';
  private readonly fila = process.env.FILA_DENUNCIAS ?? 'denuncias.processamento';

  /**
   * Enfileira uma mensagem para processamento assíncrono de uma denúncia.
   * @param denunciaId id da denúncia
   * @param acao ação a ser executada pelo worker (ex.: 'processar', 'notificar')
   * @param payload dados adicionais
   */
  async enfileirarDenuncia(
    denunciaId: string,
    acao: string,
    payload?: Record<string, unknown>,
  ): Promise<void> {
    const corpo = {
      fila: this.fila,
      payload: {
        denunciaId,
        acao,
        ...(payload ?? {}),
        enfileiradoEm: new Date().toISOString(),
      },
    };

    try {
      const resposta = await fetch(`${this.filaUrl}/q`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      });

      if (!resposta.ok) {
        throw new Error(
          `Fila respondeu ${resposta.status} ${resposta.statusText}`,
        );
      }

      const resultado = await resposta.json();
      this.logger.log(
        `Denúncia ${denunciaId} enfileirada (ação: ${acao}, id: ${resultado.id})`,
      );
    } catch (erro: any) {
      // Não bloqueia a criação da denúncia se a fila estiver fora do ar.
      this.logger.error(
        `Falha ao enfileirar denúncia ${denunciaId}: ${erro?.message ?? erro}`,
      );
    }
  }
}
