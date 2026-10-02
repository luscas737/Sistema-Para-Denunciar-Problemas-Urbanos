import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErroDetalheDto {
  @ApiProperty({ example: 'titulo', description: 'Campo ou parâmetro que falhou' })
  campo: string;

  @ApiProperty({ example: 'O titulo deve ter entre 5 e 100 caracteres' })
  mensagem: string;
}

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
