import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TiposPermitidos } from '../common/decorators/tipos-usuario.decorator';
import { ErroDto } from '../common/dto/erro.dto';
import {
  CABECALHO_TIPO_USUARIO,
  CABECALHO_USUARIO_ID,
  TipoUsuarioGuard,
} from '../common/guards/tipo-usuario.guard';
import { TipoUsuario } from '../common/tipos-usuario';
import {
  CriarEncaminhamentoDto,
  EncaminhamentoResponseDto,
  ListaEncaminhamentosResponseDto,
  ListarEncaminhamentosQueryDto,
} from './dto/encaminhamento.dto';
import { EncaminhamentosService } from './encaminhamentos.service';
import { paraEncaminhamentoDto, paraPaginacao } from './encaminhamentos.mapper';

@ApiTags('encaminhamentos')
@ApiHeader({
  name: CABECALHO_TIPO_USUARIO,
  required: false,
  description: 'Tipo do usuário: cidadao (padrão), atendente ou administrador',
})
@ApiHeader({
  name: CABECALHO_USUARIO_ID,
  required: false,
  description: 'Id do atendente que está encaminhando',
})
@UseGuards(TipoUsuarioGuard)
@Controller()
@ApiResponse({ status: 400, type: ErroDto, description: 'Dados inválidos' })
export class EncaminhamentosController {
  constructor(private readonly service: EncaminhamentosService) {}

  @Post('denuncias/:id/encaminhamentos')
  @TiposPermitidos(TipoUsuario.ATENDENTE, TipoUsuario.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Encaminha a denúncia para um setor e move o status para "encaminhada"',
    description:
      'Na mesma transação: cria o encaminhamento, define o setorAtualId da denúncia e dispara a transição de status.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Id da denúncia' })
  @ApiResponse({ status: 201, type: EncaminhamentoResponseDto })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Denúncia ou setor não encontrado' })
  @ApiResponse({ status: 409, type: ErroDto, description: 'Setor inativo, denúncia arquivada ou reencaminhamento' })
  async criar(
    @Param('id', ParseUUIDPipe) denunciaId: string,
    @Body() dto: CriarEncaminhamentoDto,
    @Headers(CABECALHO_TIPO_USUARIO) tipoUsuario?: string,
    @Headers(CABECALHO_USUARIO_ID) usuarioId?: string,
  ): Promise<EncaminhamentoResponseDto> {
    const encaminhamento = await this.service.criar(denunciaId, dto, {
      usuarioId: usuarioId ?? '',
      tipo: (tipoUsuario as TipoUsuario) ?? TipoUsuario.ATENDENTE,
    });
    return paraEncaminhamentoDto(encaminhamento);
  }

  @Get('denuncias/:id/encaminhamentos')
  @ApiOperation({ summary: 'Lista os encaminhamentos de uma denúncia' })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Id da denúncia' })
  @ApiResponse({ status: 200, type: ListaEncaminhamentosResponseDto })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Denúncia não encontrada' })
  async listar(
    @Param('id', ParseUUIDPipe) denunciaId: string,
    @Query() filtros: ListarEncaminhamentosQueryDto,
  ): Promise<ListaEncaminhamentosResponseDto> {
    const { itens, total } = await this.service.listarPorDenuncia(denunciaId, filtros);
    return {
      ...paraPaginacao(filtros.pagina, filtros.limite, total),
      itens: itens.map(paraEncaminhamentoDto),
    };
  }

  @Patch('encaminhamentos/:id/aceite')
  @TiposPermitidos(TipoUsuario.ATENDENTE, TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Confirma o recebimento (aceite) do encaminhamento' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: EncaminhamentoResponseDto })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Encaminhamento não encontrado' })
  @ApiResponse({ status: 409, type: ErroDto, description: 'Encaminhamento já aceito' })
  async aceitar(@Param('id', ParseUUIDPipe) id: string): Promise<EncaminhamentoResponseDto> {
    return paraEncaminhamentoDto(await this.service.registrarAceite(id));
  }
}
