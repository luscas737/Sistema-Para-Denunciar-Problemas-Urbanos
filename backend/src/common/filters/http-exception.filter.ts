import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErroDetalheDto } from '../dto/erro.dto';

interface CorpoErro {
  statusCode: number;
  mensagem: string;
  detalhes?: ErroDetalheDto[];
}

function extrairDetalhes(corpo: unknown): ErroDetalheDto[] | undefined {
  if (!corpo || typeof corpo !== 'object') return undefined;
  const mensagem = (corpo as { message?: unknown }).message;
  if (!Array.isArray(mensagem)) return undefined;
  return mensagem.map((item) => {
    if (typeof item === 'string') return { campo: '(geral)', mensagem: item };
    const objeto = item as { field?: string; message?: string };
    return { campo: objeto.field ?? '(geral)', mensagem: objeto.message ?? String(item) };
  });
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(excecao: unknown, host: ArgumentsHost): void {
    const resposta = host.switchToHttp().getResponse<Response>();

    // ValidationPipe (class-validator) lança BadRequestException com mensagem em array de ValidationError
    if (excecao instanceof BadRequestException) {
      const corpo = excecao.getResponse() as
        | { message: string | unknown[] }
        | string;
      let mensagem = 'Dados inválidos';
      let detalhes: ErroDetalheDto[] | undefined;

      if (typeof corpo === 'object' && corpo !== null) {
        const msg = corpo.message;
        if (Array.isArray(msg)) {
          mensagem = 'Dados inválidos';
          detalhes = msg.map((item) => {
            if (typeof item === 'string')
              return { campo: '(geral)', mensagem: item };
            const objeto = item as {
              property?: string;
              constraints?: Record<string, string>;
              value?: unknown;
            };
            const campo = objeto.property ?? '(corpo)';
            const constraints = objeto.constraints ?? {};
            const msgTexto =
              Object.values(constraints).join(', ') ||
              (objeto.value !== undefined
                ? `Valor inválido para ${campo}`
                : String(item));
            return { campo, mensagem: msgTexto };
          });
        } else if (typeof msg === 'string') {
          mensagem = msg;
        }
      }

      this.responder(resposta, {
        statusCode: HttpStatus.BAD_REQUEST,
        mensagem,
        ...(detalhes ? { detalhes } : {}),
      });
      return;
    }

    if (excecao instanceof HttpException) {
      const status = excecao.getStatus();
      const corpo = excecao.getResponse();
      const bruto =
        typeof corpo === 'object' && corpo !== null
          ? (corpo as { message?: unknown }).message
          : corpo;
      const detalhes = extrairDetalhes(corpo);
      const mensagem =
        typeof bruto === 'string'
          ? bruto
          : Array.isArray(bruto)
            ? 'Requisição inválida'
            : excecao.message;
      this.responder(resposta, {
        statusCode: status,
        mensagem,
        ...(detalhes ? { detalhes } : {}),
      });
      return;
    }

    this.logger.error('Erro não tratado na API', excecao as Error);
    this.responder(resposta, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      mensagem: 'Erro interno no servidor',
    });
  }

  private responder(resposta: Response, corpo: CorpoErro): void {
    resposta.status(corpo.statusCode).json(corpo);
  }
}
