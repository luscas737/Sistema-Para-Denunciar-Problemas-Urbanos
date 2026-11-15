import {
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsPositive,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type, plainToInstance } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { EstadoExemplar } from '../entities/exemplar.entity';

export class CriarObraDto {
  @ApiProperty({ example: 'Dom Casmurro', description: 'Título da obra' })
  @IsString({ message: 'O título deve ser uma string' })
  @MinLength(3, { message: 'O título deve ter pelo menos 3 caracteres' })
  @MaxLength(200, { message: 'O título deve ter no máximo 200 caracteres' })
  titulo: string;

  @ApiPropertyOptional({
    example: '978-85-359-1477-7',
    description: 'ISBN da obra',
  })
  @IsOptional()
  @IsString({ message: 'O ISBN deve ser uma string' })
  @MaxLength(50, { message: 'O ISBN deve ter no máximo 50 caracteres' })
  isbn?: string | null;

  @ApiPropertyOptional({
    example: 1899,
    description: 'Ano de publicação',
  })
  @IsOptional()
  @IsInt({ message: 'O ano de publicação deve ser um número inteiro' })
  @Min(1000, { message: 'O ano de publicação deve ser >= 1000' })
  @Max(2100, { message: 'O ano de publicação deve ser <= 2100' })
  anoPublicacao?: number | null;

  @ApiProperty({ description: 'ID do autor' })
  @IsString({ message: 'O ID do autor deve ser uma string' })
  @MinLength(1, { message: 'O ID do autor é obrigatório' })
  autorId: string;
}

export class AtualizarObraDto extends PartialType(CriarObraDto) {}

export class ListarObrasQueryDto {
  @ApiPropertyOptional({ example: 'dom', description: 'Busca por título' })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'A busca deve ter no máximo 100 caracteres' })
  q?: string;

  @ApiPropertyOptional({ description: 'Filtrar por autor' })
  @IsOptional()
  @IsString({ message: 'O ID do autor deve ser uma string' })
  @MinLength(1, { message: 'O ID do autor não pode ser vazio' })
  autorId?: string;

  @ApiPropertyOptional({ example: 1850, description: 'Ano mínimo' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O ano mínimo deve ser um número inteiro' })
  de?: number;

  @ApiPropertyOptional({ example: 2000, description: 'Ano máximo' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O ano máximo deve ser um número inteiro' })
  ate?: number;

  @ApiPropertyOptional({ example: 1, default: 1, description: 'Página' })
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: 'A página deve ser um número positivo' })
  pagina?: number;

  @ApiPropertyOptional({ example: 20, default: 20, description: 'Itens por página (máx. 100)' })
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: 'O limite deve ser um número positivo' })
  @Max(100, { message: 'O limite máximo é 100 itens por página' })
  limite?: number;
}

export class ObraAutorResumoDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Machado de Assis' })
  nome: string;
}

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

  @ApiProperty({ nullable: true, type: () => ObraAutorResumoDto })
  autor: ObraAutorResumoDto | null;

  @ApiProperty({ example: '2026-09-29T15:00:00.000Z' })
  criadoEm: Date;

  @ApiProperty({ example: '2026-09-29T15:00:00.000Z' })
  atualizadoEm: Date;

  static de(obra: any): ObraResponseDto {
    const dto = new ObraResponseDto();
    dto.id = obra.id;
    dto.titulo = obra.titulo;
    dto.isbn = obra.isbn;
    dto.anoPublicacao = obra.anoPublicacao;
    dto.autorId = obra.autorId;
    dto.autor = obra.autor
      ? plainToInstance(ObraAutorResumoDto, {
          id: obra.autor.id,
          nome: obra.autor.nome,
        })
      : null;
    dto.criadoEm = obra.criadoEm;
    dto.atualizadoEm = obra.atualizadoEm;
    return dto;
  }
}

export class ListaObrasResponseDto {
  @ApiProperty({ type: () => [ObraResponseDto] })
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
