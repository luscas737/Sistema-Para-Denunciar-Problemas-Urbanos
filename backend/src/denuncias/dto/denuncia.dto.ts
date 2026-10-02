import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { CategoriaDenuncia, StatusDenuncia } from '../denuncia.enums';

export const categoriaEnum = z.nativeEnum(CategoriaDenuncia);
export const statusEnum = z.nativeEnum(StatusDenuncia);

export const criarDenunciaSchema = z.object({
  titulo: z
    .string()
    .min(5, 'O título deve ter entre 5 e 100 caracteres')
    .max(100, 'O título deve ter entre 5 e 100 caracteres'),
  descricao: z
    .string()
    .min(10, 'A descrição deve ter entre 10 e 1000 caracteres')
    .max(1000, 'A descrição deve ter entre 10 e 1000 caracteres'),
  categoria: categoriaEnum,
  latitude: z
    .number({ invalid_type_error: 'Clique no mapa ou informe a latitude' })
    .min(-90, 'A latitude deve estar entre -90 e 90')
    .max(90, 'A latitude deve estar entre -90 e 90'),
  longitude: z
    .number({ invalid_type_error: 'Clique no mapa ou informe a longitude' })
    .min(-180, 'A longitude deve estar entre -180 e 180')
    .max(180, 'A longitude deve estar entre -180 e 180'),
  cidadaoId: z.string().uuid('Informe um UUID válido para o cidadão').optional().nullable(),
});

export const atualizarDenunciaSchema = criarDenunciaSchema.partial();

export const listarDenunciasSchema = z.object({
  status: statusEnum.optional(),
  categoria: categoriaEnum.optional(),
  setor: z.string().uuid('Informe um UUID válido para o setor').optional(),
  busca: z.string().max(100, 'A busca deve ter no máximo 100 caracteres').optional(),
  arquivadas: z
    .enum(['true', 'false'])
    .transform((valor) => valor === 'true')
    .optional(),
  pagina: z.coerce.number().int('A página deve ser um número inteiro').positive('A página deve ser maior que zero').default(1),
  limite: z.coerce
    .number()
    .int('O limite deve ser um número inteiro')
    .positive('O limite deve ser maior que zero')
    .max(100, 'O limite máximo é 100')
    .default(20),
});

export class CriarDenunciaDto extends createZodDto(criarDenunciaSchema) {}
export class AtualizarDenunciaDto extends createZodDto(atualizarDenunciaSchema) {}
export class ListarDenunciasQueryDto extends createZodDto(listarDenunciasSchema) {}

/** DTO de saída: o contrato exposto não é a entidade. */
export class DenunciaResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Buraco na Rua Principal' })
  titulo: string;

  @ApiProperty({ example: 'Buraco grande em frente ao número 100.' })
  descricao: string;

  @ApiProperty({ enum: CategoriaDenuncia, example: CategoriaDenuncia.BURACO })
  categoria: CategoriaDenuncia;

  @ApiProperty({ example: -8.9016 })
  latitude: number;

  @ApiProperty({ example: -36.4926 })
  longitude: number;

  @ApiProperty({ enum: StatusDenuncia, example: StatusDenuncia.RECEBIDA })
  status: StatusDenuncia;

  @ApiProperty({ nullable: true, format: 'uuid', description: 'Autor da denúncia (nulo se anônima)' })
  cidadaoId: string | null;

  @ApiProperty({ nullable: true, format: 'uuid', description: 'Setor responsável atual' })
  setorAtualId: string | null;

  @ApiProperty({ example: false })
  arquivada: boolean;

  @ApiProperty({ nullable: true })
  arquivadaEm: Date | null;

  @ApiProperty({ example: '2026-09-29T15:00:00.000Z' })
  criadoEm: Date;

  @ApiProperty({ example: '2026-09-29T15:00:00.000Z' })
  atualizadoEm: Date;
}

export class PaginacaoDto {
  @ApiProperty({ example: 1 })
  pagina: number;

  @ApiProperty({ example: 20 })
  limite: number;

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPaginas: number;
}

export class ListaDenunciasResponseDto extends PaginacaoDto {
  @ApiProperty({ type: [DenunciaResponseDto] })
  itens: DenunciaResponseDto[];
}
