import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
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

    if (excecao instanceof ZodValidationException) {
      const detalhes = excecao.getZodError().errors.map((erro) => ({
        campo: erro.path.join('.') || '(corpo)',
        mensagem: erro.message,
      }));
      this.responder(resposta, {
        statusCode: HttpStatus.BAD_REQUEST,
        mensagem: 'Dados inválidos',
        detalhes,
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
