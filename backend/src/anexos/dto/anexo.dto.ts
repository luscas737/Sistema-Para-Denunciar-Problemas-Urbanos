import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const criarAnexoSchema = z.object({
  url: z
    .string()
    .url('Informe uma URL válida (decisão D4: anexo por URL, sem upload)')
    .max(500, 'A URL deve ter no máximo 500 caracteres'),
  tipo: z.enum(['imagem', 'documento'], {
    errorMap: () => ({ message: 'O tipo deve ser "imagem" ou "documento"' }),
  }),
  descricao: z.string().max(200, 'A descrição deve ter no máximo 200 caracteres').optional().nullable(),
});

export class CriarAnexoDto extends createZodDto(criarAnexoSchema) {}

export class AnexoResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  denunciaId: string;

  @ApiProperty({ example: 'https://cdn.exemplo.com/foto.jpg', maxLength: 500 })
  url: string;

  @ApiProperty({ enum: ['imagem', 'documento'], example: 'imagem' })
  tipo: 'imagem' | 'documento';

  @ApiProperty({ nullable: true, example: 'Foto do buraco' })
  descricao: string | null;

  @ApiProperty({ nullable: true, format: 'uuid', example: null, description: 'Usuário que enviou (opcional)' })
  enviadoPorId: string | null;

  @ApiProperty({ example: '2026-09-29T15:00:00.000Z' })
  criadoEm: Date;
}