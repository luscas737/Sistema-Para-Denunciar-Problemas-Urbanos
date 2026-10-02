import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
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
import { DenunciasService } from './denuncias.service';
import { paraDenunciaDto, paraPaginacao } from './denuncias.mapper';
import {
  AtualizarDenunciaDto,
  AtualizarStatusDto,
  CriarDenunciaDto,
  DenunciaResponseDto,
  ListaDenunciasResponseDto,
  ListarDenunciasQueryDto,
} from './dto/denuncia.dto';

@ApiTags('denuncias')
@ApiHeader({
  name: CABECALHO_TIPO_USUARIO,
  required: false,
  description: 'Tipo do usuário: cidadao (padrão), atendente ou administrador',
})
@ApiHeader({
  name: CABECALHO_USUARIO_ID,
  required: false,
  description: 'Id do usuário que executa a ação (usado no histórico de status)',
})
@UseGuards(TipoUsuarioGuard)
@Controller('denuncias')
@ApiResponse({ status: 400, type: ErroDto, description: 'Dados inválidos' })
export class DenunciasController {
  constructor(private readonly denunciasService: DenunciasService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra uma denúncia (autor opcional: denúncia anônima é permitida)' })
  @ApiResponse({ status: 201, type: DenunciaResponseDto, description: 'Denúncia cadastrada com status `recebida`' })
  async criar(@Body() dto: CriarDenunciaDto): Promise<DenunciaResponseDto> {
    return paraDenunciaDto(await this.denunciasService.criar(dto));
  }

  @Get()
  @ApiOperation({
    summary: 'Lista denúncias com filtros, busca e paginação (arquivadas ficam fora por padrão)',
  })
  @ApiResponse({ status: 200, type: ListaDenunciasResponseDto })
  async listar(@Query() filtros: ListarDenunciasQueryDto): Promise<ListaDenunciasResponseDto> {
    const { itens, total } = await this.denunciasService.listar(filtros);
    return {
      ...paraPaginacao(filtros.pagina, filtros.limite, total),
      itens: itens.map(paraDenunciaDto),
    };
  }

  @Get('mapa')
  @ApiOperation({ summary: 'Lista todas as denúncias ativas para exibição no mapa (sem paginação)' })
  @ApiResponse({ status: 200, type: [DenunciaResponseDto] })
  async listarParaMapa(@Query() filtros: ListarDenunciasQueryDto): Promise<DenunciaResponseDto[]> {
    const denuncias = await this.denunciasService.listarParaMapa(filtros);
    return denuncias.map(paraDenunciaDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma denúncia pelo id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: DenunciaResponseDto })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Denúncia não encontrada' })
  async obterPorId(@Param('id', ParseUUIDPipe) id: string): Promise<DenunciaResponseDto> {
    return paraDenunciaDto(await this.denunciasService.obterPorId(id));
  }

  @Patch(':id/status')
  @TiposPermitidos(TipoUsuario.ATENDENTE, TipoUsuario.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Muda o status seguindo o fluxo recebida -> encaminhada -> em_andamento -> resolvida',
    description:
      'Transição inválida responde 409. Reabertura (resolvida -> recebida) é exclusiva do administrador e exige comentário.',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: DenunciaResponseDto })
  @ApiResponse({ status: 403, type: ErroDto, description: 'Transição não permitida para este tipo de usuário' })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Denúncia não encontrada' })
  @ApiResponse({ status: 409, type: ErroDto, description: 'Transição de status inválida' })
  async alterarStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarStatusDto,
    @Headers(CABECALHO_TIPO_USUARIO) tipoUsuario?: string,
    @Headers(CABECALHO_USUARIO_ID) usuarioId?: string,
  ): Promise<DenunciaResponseDto> {
    return paraDenunciaDto(
      await this.denunciasService.alterarStatus(id, dto, {
        tipo: (tipoUsuario as TipoUsuario) ?? TipoUsuario.CIDADAO,
        usuarioId: usuarioId ?? null,
      }),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de uma denúncia (status tem rota própria)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: DenunciaResponseDto })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Denúncia não encontrada' })
  async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarDenunciaDto,
  ): Promise<DenunciaResponseDto> {
    return paraDenunciaDto(await this.denunciasService.atualizar(id, dto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Arquiva uma denúncia (não há exclusão física — decisão D2)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: DenunciaResponseDto, description: 'Denúncia arquivada' })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Denúncia não encontrada' })
  async arquivar(@Param('id', ParseUUIDPipe) id: string): Promise<DenunciaResponseDto> {
    return paraDenunciaDto(await this.denunciasService.arquivar(id));
  }
}
