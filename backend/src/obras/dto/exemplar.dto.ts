import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type, plainToInstance } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { EstadoExemplar } from '../entities/exemplar.entity';

export class CriarExemplarDto {
  @ApiProperty({
    example: 'T-000123',
    description: 'Tombo do exemplar (3-20 caracteres: maiúsculas, números e hífen)',
  })
  @IsString({ message: 'O tombo deve ser uma string' })
  @MinLength(3, { message: 'O tombo deve ter pelo menos 3 caracteres' })
  @MaxLength(20, { message: 'O tombo deve ter no máximo 20 caracteres' })
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'O tombo deve conter apenas letras maiúsculas, números e hífen',
  })
  tombo: string;

  @ApiProperty({ example: 'DISPONIVEL', enum: EstadoExemplar, description: 'Estado físico do exemplar' })
  @IsEnum(EstadoExemplar, { message: 'Estado deve ser um dos valores válidos: DISPONIVEL, EMPRESTADO, DESGASTADO, DESCARTADO' })
  estado: EstadoExemplar;

  @ApiProperty({ description: 'ID da obra associada' })
  @IsString({ message: 'O ID da obra deve ser uma string' })
  @MinLength(1, { message: 'O ID da obra é obrigatório' })
  obraId: string;

  @ApiPropertyOptional({ example: '2026-01-15', description: 'Data de aquisição (não pode ser futura)' })
  @IsOptional()
  @IsDateString({}, { message: 'Data de aquisição inválida' })
  dataAquisicao?: string;
}

export class AtualizarExemplarDto extends PartialType(CriarExemplarDto) {}

export class ObraResumoDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Dom Casmurro' })
  titulo: string;
}

export class ExemplarResposta {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'T-000123' })
  tombo: string;

  @ApiProperty({ example: 'DISPONIVEL', enum: EstadoExemplar })
  estado: EstadoExemplar;

  @ApiProperty({ description: 'Título da obra associada (não o obraId)' })
  obraTitulo: string;

  @ApiPropertyOptional({ example: '2026-01-15' })
  dataAquisicao?: Date | null;

  @ApiProperty({ example: '2026-09-29T15:00:00.000Z' })
  criadoEm: Date;

  @ApiProperty({ example: '2026-09-29T15:00:00.000Z' })
  atualizadoEm: Date;

  static de(exemplar: any): ExemplarResposta {
    const dto = new ExemplarResposta();
    dto.id = exemplar.id;
    dto.tombo = exemplar.tombo;
    dto.estado = exemplar.estado;
    dto.obraTitulo = exemplar.obra?.titulo ?? '';
    dto.dataAquisicao = exemplar.dataAquisicao;
    dto.criadoEm = exemplar.criadoEm;
    dto.atualizadoEm = exemplar.atualizadoEm;
    return dto;
  }
}

export class ListaExemplaresResponseDto {
  @ApiProperty({ type: () => [ExemplarResposta] })
  itens: ExemplarResposta[];

  @ApiProperty({ example: 1 })
  pagina: number;

  @ApiProperty({ example: 20 })
  limite: number;

  @ApiProperty({ example: 200 })
  total: number;

  @ApiProperty({ example: 10 })
  totalPaginas: number;
}