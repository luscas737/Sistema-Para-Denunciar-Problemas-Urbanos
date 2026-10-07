import { ApiProperty } from '@nestjs/swagger';
import { StatusDenuncia } from '../../denuncias/denuncia.enums';
import { TipoUsuario } from '../../common/tipos-usuario';

export class HistoricoStatusResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  denunciaId: string;

  @ApiProperty({ nullable: true, enum: StatusDenuncia, example: null, description: '`null` na criação da denúncia`' })
  statusAnterior: StatusDenuncia | null;

  @ApiProperty({ enum: StatusDenuncia, example: StatusDenuncia.ENCAMINHADA })
  statusAtual: StatusDenuncia;

  @ApiProperty({ nullable: true, format: 'uuid', example: null, description: '`null` = sistema' })
  alteradoPorId: string | null;

  @ApiProperty({
    nullable: true,
    enum: TipoUsuario,
    example: TipoUsuario.ATENDENTE,
    description: 'Papel de quem alterou (resolvido a partir do usuário)',
  })
  alteradoPorTipo: TipoUsuario | null;

  @ApiProperty({ nullable: true, example: 'Denúncia reaberta para revisão' })
  comentario: string | null;

  @ApiProperty({ example: '2026-09-29T15:00:00.000Z' })
  dataAlteracao: Date;
}

export class EventoLinhaTempoDto {
  @ApiProperty({ enum: ['status', 'encaminhamento', 'anexo'] })
  tipo: 'status' | 'encaminhamento' | 'anexo';

  @ApiProperty({ example: '2026-09-29T15:00:00.000Z' })
  em: Date;

  @ApiProperty({
    nullable: true,
    enum: TipoUsuario,
    example: TipoUsuario.CIDADAO,
    description: 'Papel de quem executou a ação (`null` = sistema)',
  })
  por: TipoUsuario | null;

  // --- somente eventos de status ---
  @ApiProperty({ nullable: true, enum: StatusDenuncia, example: null })
  de?: StatusDenuncia | null;

  @ApiProperty({ nullable: true, enum: StatusDenuncia, example: StatusDenuncia.RECEBIDA })
  para?: StatusDenuncia | null;

  @ApiProperty({ nullable: true, example: 'Denúncia reaberta para revisão' })
  comentario?: string | null;

  // --- somente eventos de encaminhamento ---
  @ApiProperty({ nullable: true, example: 'Obras', description: 'Nome do setor de destino' })
  setor?: string | null;

  @ApiProperty({ nullable: true, example: 'Encaminhado para vistoria.' })
  observacao?: string | null;

  // --- somente eventos de anexo ---
  @ApiProperty({ nullable: true, example: 'https://cdn.exemplo.com/foto.jpg' })
  url?: string | null;

  @ApiProperty({ nullable: true, example: 'Foto do buraco' })
  descricao?: string | null;
}

export class LinhaDoTempoResponseDto {
  @ApiProperty({ format: 'uuid' })
  denunciaId: string;

  @ApiProperty({ enum: StatusDenuncia, example: StatusDenuncia.EM_ANDAMENTO })
  statusAtual: StatusDenuncia;

  @ApiProperty({ type: [EventoLinhaTempoDto], description: 'Ordenado por data crescente' })
  eventos: EventoLinhaTempoDto[];
}