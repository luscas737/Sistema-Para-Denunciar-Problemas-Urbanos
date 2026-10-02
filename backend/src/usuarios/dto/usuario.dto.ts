import { ApiProperty } from '@nestjs/swagger';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TipoUsuario } from '../../common/tipos-usuario';

export const cpfSchema = z
  .string()
  .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'Informe um CPF válido (000.000.000-00)');

export const criarCidadaoSchema = z.object({
  nome: z
    .string()
    .min(3, 'O nome deve ter entre 3 e 120 caracteres')
    .max(120, 'O nome deve ter entre 3 e 120 caracteres'),
  email: z
    .string()
    .email('Informe um e-mail válido')
    .max(160, 'O e-mail deve ter no máximo 160 caracteres'),
  telefone: z.string().max(20, 'O telefone deve ter no máximo 20 caracteres').optional().nullable(),
  cpf: cpfSchema.optional().nullable(),
  bairro: z.string().max(80, 'O bairro deve ter no máximo 80 caracteres').optional().nullable(),
});

export const atualizarCidadaoSchema = criarCidadaoSchema.partial().extend({
  ativo: z.boolean().optional(),
});

export const listarUsuariosSchema = z.object({
  tipo: z.nativeEnum(TipoUsuario).optional(),
  ativo: z
    .enum(['true', 'false'])
    .transform((valor) => valor === 'true')
    .optional(),
  nome: z.string().max(120).optional(),
});

export class CriarCidadaoDto extends createZodDto(criarCidadaoSchema) {}
export class AtualizarCidadaoDto extends createZodDto(atualizarCidadaoSchema) {}
export class ListarUsuariosQueryDto extends createZodDto(listarUsuariosSchema) {}

/** DTO de saída: nunca devolve a entidade direto, para o contrato ficar estável. */
export class UsuarioResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ enum: TipoUsuario, example: TipoUsuario.CIDADAO })
  tipo: TipoUsuario;

  @ApiProperty({ example: 'Ana Souza' })
  nome: string;

  @ApiProperty({ example: 'ana@exemplo.com' })
  email: string;

  @ApiProperty({ nullable: true, example: '(81) 99999-0000' })
  telefone: string | null;

  @ApiProperty({ example: true })
  ativo: boolean;

  @ApiProperty({ example: '2026-09-29T15:00:00.000Z' })
  criadoEm: Date;

  @ApiProperty({ example: '2026-09-29T15:00:00.000Z' })
  atualizadoEm: Date;
}

export class CidadaoResponseDto extends UsuarioResponseDto {
  @ApiProperty({ nullable: true, example: '000.000.000-00' })
  cpf: string | null;

  @ApiProperty({ nullable: true, example: 'Centro' })
  bairro: string | null;
}
