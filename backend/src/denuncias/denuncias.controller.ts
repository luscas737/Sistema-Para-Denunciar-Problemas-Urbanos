import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ErroDto } from '../common/dto/erro.dto';
import { CABECALHO_TIPO_USUARIO, TipoUsuarioGuard } from '../common/guards/tipo-usuario.guard';
import { DenunciasService } from './denuncias.service';
import { paraDenunciaDto, paraPaginacao } from './denuncias.mapper';
import {
  AtualizarDenunciaDto,
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

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de uma denúncia' })
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
