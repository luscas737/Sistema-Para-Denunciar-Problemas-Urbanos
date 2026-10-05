import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const criarSetorSchema = z.object({
  nome: z
    .string()
    .min(3, 'O nome deve ter entre 3 e 120 caracteres')
    .max(120, 'O nome deve ter entre 3 e 120 caracteres'),
  descricao: z
    .string()
    .max(300, 'A descrição deve ter no máximo 300 caracteres')
    .optional()
    .nullable(),
  email: z
    .string()
    .email('Informe um e-mail válido')
    .max(160, 'O e-mail deve ter no máximo 160 caracteres')
    .optional()
    .nullable(),
  ativo: z.boolean().optional(),
});

export const atualizarSetorSchema = criarSetorSchema.partial();

export const listarSetoresSchema = z.object({
  incluirInativos: z
    .enum(['true', 'false'])
    .transform((valor) => valor === 'true')
    .optional(),
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

export class CriarSetorDto extends createZodDto(criarSetorSchema) {}
export class AtualizarSetorDto extends createZodDto(atualizarSetorSchema) {}
export class ListarSetoresQueryDto extends createZodDto(listarSetoresSchema) {}

export class SetorResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Obras' })
  nome: string;

  @ApiProperty({ nullable: true, example: 'Responsável por buracos, calçadas e vias.' })
  descricao: string | null;

  @ApiProperty({ nullable: true, example: 'obras@cidade.gov.br' })
  email: string | null;

  @ApiProperty({ example: true })
  ativo: boolean;

  @ApiProperty({ example: '2026-09-29T15:00:00.000Z' })
  criadoEm: Date;

  @ApiProperty({ example: '2026-09-29T15:00:00.000Z' })
  atualizadoEm: Date;
}

export class ListaSetoresResponseDto {
  @ApiProperty({ type: [SetorResponseDto] })
  itens: SetorResponseDto[];

  @ApiProperty({ example: 1 })
  pagina: number;

  @ApiProperty({ example: 20 })
  limite: number;

  @ApiProperty({ example: 5 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPaginas: number;
}
