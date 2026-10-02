import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Detalhe de um campo inválido na resposta de erro. */
export class ErroDetalheDto {
  @ApiProperty({ example: 'titulo', description: 'Campo ou parâmetro que falhou' })
  campo: string;

  @ApiProperty({ example: 'O titulo deve ter entre 5 e 100 caracteres' })
  mensagem: string;
}

/** Formato único de erro da API (400, 403, 404, 409 e 500). */
export class ErroDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Dados inválidos' })
  mensagem: string;

  @ApiPropertyOptional({
    type: [ErroDetalheDto],
    description: 'Preenchido quando o erro é de validação por campo',
  })
  detalhes?: ErroDetalheDto[];
}
