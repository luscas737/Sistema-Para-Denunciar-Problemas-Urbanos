import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const criarEncaminhamentoSchema = z.object({
  setorDestinoId: z.string().uuid('Informe um UUID válido para o setor de destino'),
  observacao: z
    .string()
    .max(500, 'A observação deve ter no máximo 500 caracteres')
    .optional()
    .nullable(),
});

export const listarEncaminhamentosSchema = z.object({
  pagina: z.coerce
    .number()
    .int('A página deve ser um número inteiro')
    .positive('A página deve ser maior que zero')
    .default(1),
  limite: z.coerce
    .number()
    .int('O limite deve ser um número inteiro')
    .positive('O limite deve ser maior que zero')
    .max(100, 'O limite máximo é 100')
    .default(20),
});

export class CriarEncaminhamentoDto extends createZodDto(criarEncaminhamentoSchema) {}
export class ListarEncaminhamentosQueryDto extends createZodDto(listarEncaminhamentosSchema) {}

export class EncaminhamentoResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  denunciaId: string;

  @ApiProperty({ format: 'uuid' })
  setorDestinoId: string;

  @ApiProperty({ format: 'uuid' })
  enviadoPorId: string;

  @ApiProperty({ nullable: true, example: 'Encaminhado para vistoria.' })
  observacao: string | null;

  @ApiProperty({ example: '2026-10-05T14:00:00.000Z' })
  dataEncaminhamento: Date;

  @ApiProperty({ nullable: true, example: null, description: 'Preenchido quando o setor confirma o recebimento' })
  aceite: Date | null;
}

export class ListaEncaminhamentosResponseDto {
  @ApiProperty({ type: [EncaminhamentoResponseDto] })
  itens: EncaminhamentoResponseDto[];

  @ApiProperty({ example: 1 })
  pagina: number;

  @ApiProperty({ example: 20 })
  limite: number;

  @ApiProperty({ example: 3 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPaginas: number;
}
