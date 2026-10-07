import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TiposPermitidos } from '../common/decorators/tipos-usuario.decorator';
import { ErroDto } from '../common/dto/erro.dto';
import {
  CABECALHO_TIPO_USUARIO,
  CABECALHO_USUARIO_ID,
  TipoUsuarioGuard,
} from '../common/guards/tipo-usuario.guard';
import { TipoUsuario } from '../common/tipos-usuario';
import { AnexoResponseDto, CriarAnexoDto } from './dto/anexo.dto';
import { paraAnexoDto } from './anexos.mapper';
import { AnexosService } from './anexos.service';

@ApiTags('anexos')
@ApiHeader({
  name: CABECALHO_TIPO_USUARIO,
  required: false,
  description: 'Tipo do usuário: cidadao (padrão), atendente ou administrador',
})
@ApiHeader({
  name: CABECALHO_USUARIO_ID,
  required: false,
  description: 'Id do usuário que envia o anexo (opcional)',
})
@UseGuards(TipoUsuarioGuard)
@Controller('denuncias/:id/anexos')
@ApiResponse({ status: 400, type: ErroDto, description: 'Dados inválidos (URL, tipo ou formato)' })
export class AnexosController {
  constructor(private readonly service: AnexosService) {}

  @Post()
  @TiposPermitidos(TipoUsuario.CIDADAO, TipoUsuario.ATENDENTE, TipoUsuario.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Adiciona um anexo (URL) à denúncia',
    description:
      'Decisão D4: anexo por URL (sem upload). Limite de 5 anexos por denúncia (409); denúncia arquivada responde 409.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Id da denúncia' })
  @ApiResponse({ status: 201, type: AnexoResponseDto, description: 'Anexo cadastrado' })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Denúncia não encontrada' })
  @ApiResponse({ status: 409, type: ErroDto, description: 'Limite de 5 anexos ou denúncia arquivada' })
  async criar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CriarAnexoDto,
    @Headers(CABECALHO_USUARIO_ID) usuarioId?: string,
  ): Promise<AnexoResponseDto> {
    return paraAnexoDto(await this.service.criar(id, dto, usuarioId || null));
  }

  @Get()
  @ApiOperation({ summary: 'Lista os anexos de uma denúncia' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Id da denúncia' })
  @ApiResponse({ status: 200, type: [AnexoResponseDto] })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Denúncia não encontrada' })
  async listar(@Param('id', ParseUUIDPipe) id: string): Promise<AnexoResponseDto[]> {
    const anexos = await this.service.listarPorDenuncia(id);
    return anexos.map(paraAnexoDto);
  }

  @Delete(':anexoId')
  @TiposPermitidos(TipoUsuario.CIDADAO, TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Remove um anexo da denúncia (cidadão ou administrador)' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Id da denúncia' })
  @ApiParam({ name: 'anexoId', format: 'uuid', description: 'Id do anexo' })
  @ApiResponse({ status: 200, type: AnexoResponseDto, description: 'Anexo removido' })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Denúncia ou anexo não encontrado' })
  async remover(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('anexoId', ParseUUIDPipe) anexoId: string,
  ): Promise<AnexoResponseDto> {
    return paraAnexoDto(await this.service.remover(id, anexoId));
  }
}