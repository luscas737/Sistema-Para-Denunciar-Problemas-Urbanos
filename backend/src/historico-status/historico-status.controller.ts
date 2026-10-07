import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErroDto } from '../common/dto/erro.dto';
import { CABECALHO_TIPO_USUARIO, TipoUsuarioGuard } from '../common/guards/tipo-usuario.guard';
import { HistoricoStatusResponseDto, LinhaDoTempoResponseDto } from './dto/historico.dto';
import { paraHistoricoDto } from './historico-status.mapper';
import { HistoricoStatusService } from './historico-status.service';

@ApiTags('denuncias-historico')
@UseGuards(TipoUsuarioGuard)
@Controller('denuncias/:id')
@ApiResponse({ status: 404, type: ErroDto, description: 'Denúncia não encontrada' })
export class HistoricoStatusController {
  constructor(private readonly service: HistoricoStatusService) {}

  @Get('historico')
  @ApiOperation({ summary: 'Lista as mudanças de status de uma denúncia (ordenadas por data)' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Id da denúncia' })
  @ApiResponse({ status: 200, type: [HistoricoStatusResponseDto] })
  async listarHistorico(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<HistoricoStatusResponseDto[]> {
    const historico = await this.service.listarPorDenuncia(id);
    return historico.map(paraHistoricoDto);
  }

  @Get('linha-do-tempo')
  @ApiOperation({
    summary: 'Linha do tempo da denúncia (read model)',
    description:
      'Junta histórico de status, encaminhamentos e anexos em ordem cronológica (decisão D8 — consulta, não tabela).',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Id da denúncia' })
  @ApiResponse({ status: 200, type: LinhaDoTempoResponseDto })
  async linhaDoTempo(@Param('id', ParseUUIDPipe) id: string): Promise<LinhaDoTempoResponseDto> {
    return this.service.linhaDoTempo(id);
  }
}