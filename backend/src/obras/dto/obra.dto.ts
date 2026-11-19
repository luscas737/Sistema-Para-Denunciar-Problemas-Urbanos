import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { EstadoExemplar } from '../entities/exemplar.entity';

export const criarObraSchema = z.object({
  titulo: z.string().min(3).max(200),
  isbn: z.string().max(50).optional().nullable(),
  anoPublicacao: z.number().int().min(1000).max(2100).optional().nullable(),
  autorId: z.string().uuid('Informe um UUID válido para o autor'),
});

export const atualizarObraSchema = criarObraSchema.partial();

export const listarObrasSchema = z.object({
  q: z.string().max(100).optional(),
  autorId: z.string().uuid().optional(),
  de: z.coerce.number().int().optional(),
  ate: z.coerce.number().int().optional(),
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().positive().max(100).default(20),
});

export class CriarObraDto extends createZodDto(criarObraSchema) {}
export class AtualizarObraDto extends createZodDto(atualizarObraSchema) {}
export class ListarObrasQueryDto extends createZodDto(listarObrasSchema) {}

export class ObraResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Dom Casmurro' })
  titulo: string;

  @ApiProperty({ nullable: true, example: '978-85-359-1477-7' })
  isbn: string | null;

  @ApiProperty({ nullable: true, example: 1899 })
  anoPublicacao: number | null;

  @ApiProperty({ format: 'uuid' })
  autorId: string;

  @ApiProperty({ nullable: true })
  autor: { id: string; nome: string } | null;

  @ApiProperty({ example: '2026-09-29T15:00:00.000Z' })
  criadoEm: Date;

  @ApiProperty({ example: '2026-09-29T15:00:00.000Z' })
  atualizadoEm: Date;
}

export class ListaObrasResponseDto {
  @ApiProperty({ type: [ObraResponseDto] })
  itens: ObraResponseDto[];

  @ApiProperty({ example: 1 })
  pagina: number;

  @ApiProperty({ example: 20 })
  limite: number;

  @ApiProperty({ example: 200 })
  total: number;

  @ApiProperty({ example: 10 })
  totalPaginas: number;
}
