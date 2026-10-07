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

export const criarAtendenteSchema = z.object({
  nome: z
    .string()
    .min(3, 'O nome deve ter entre 3 e 120 caracteres')
    .max(120, 'O nome deve ter entre 3 e 120 caracteres'),
  email: z
    .string()
    .email('Informe um e-mail válido')
    .max(160, 'O e-mail deve ter no máximo 160 caracteres'),
  telefone: z.string().max(20, 'O telefone deve ter no máximo 20 caracteres').optional().nullable(),
  matricula: z
    .string()
    .regex(/^\d{1,20}$/, 'A matrícula deve conter até 20 dígitos')
    .optional()
    .nullable(),
  setorId: z.string().uuid('Informe um UUID válido para o setor de lotação').optional().nullable(),
});

export const atualizarAtendenteSchema = criarAtendenteSchema
  .partial()
  .extend({ ativo: z.boolean().optional() });

export const criarAdministradorSchema = z.object({
  nome: z
    .string()
    .min(3, 'O nome deve ter entre 3 e 120 caracteres')
    .max(120, 'O nome deve ter entre 3 e 120 caracteres'),
  email: z
    .string()
    .email('Informe um e-mail válido')
    .max(160, 'O e-mail deve ter no máximo 160 caracteres'),
  telefone: z.string().max(20, 'O telefone deve ter no máximo 20 caracteres').optional().nullable(),
  nivelAcesso: z
    .number()
    .int('O nível de acesso deve ser inteiro')
    .min(1, 'O nível de acesso deve ser 1 ou 2')
    .max(2, 'O nível de acesso deve ser 1 ou 2')
    .optional(),
});

export const atualizarAdministradorSchema = criarAdministradorSchema
  .partial()
  .extend({ ativo: z.boolean().optional() });

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
export class CriarAtendenteDto extends createZodDto(criarAtendenteSchema) {}
export class AtualizarAtendenteDto extends createZodDto(atualizarAtendenteSchema) {}
export class ListarUsuariosQueryDto extends createZodDto(listarUsuariosSchema) {}

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

export class AtendenteResponseDto extends UsuarioResponseDto {
  @ApiProperty({ nullable: true, example: '12345' })
  matricula: string | null;

  @ApiProperty({
    nullable: true,
    format: 'uuid',
    example: 'a3f1c9d2-0f4a-4a1e-9a5c-2b7d6e8c1a01',
    description: 'Setor de lotação do atendente (SET NULL ao excluir o setor)',
  })
  setorId: string | null;
}

export class CriarAdministradorDto extends createZodDto(criarAdministradorSchema) {}
export class AtualizarAdministradorDto extends createZodDto(atualizarAdministradorSchema) {}

export class AdministradorResponseDto extends UsuarioResponseDto {
  @ApiProperty({
    example: 1,
    minimum: 1,
    maximum: 2,
    description: '1 = padrão; 2 = pode reabrir denúncia resolvida',
  })
  nivelAcesso: number;
}
