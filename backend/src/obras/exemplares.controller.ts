import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ExemplaresService } from './exemplares.service';
import {
  AtualizarExemplarDto,
  CriarExemplarDto,
  ExemplarResposta,
  ListaExemplaresResponseDto,
} from './dto/exemplar.dto';
import { EstadoExemplar } from './entities/exemplar.entity';
import { ErroDto } from '../common/dto/erro.dto';

@ApiTags('exemplares')
@Controller('exemplares')
export class ExemplaresController {
  constructor(private readonly exemplaresService: ExemplaresService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastra um exemplar' })
  @ApiResponse({ status: 201, description: 'Exemplar criado com sucesso', type: ExemplarResposta })
  @ApiResponse({ status: 400, description: 'Dados inválidos', type: ErroDto })
  @ApiResponse({ status: 404, description: 'Obra não encontrada', type: ErroDto })
  @ApiResponse({ status: 409, description: 'Conflito de regra de negócio', type: ErroDto })
  async criar(@Body() dto: CriarExemplarDto): Promise<ExemplarResposta> {
    const exemplar = await this.exemplaresService.criar(dto);
    return ExemplarResposta.de(exemplar);
  }

  @Get()
  @ApiOperation({ summary: 'Lista exemplares com paginação e filtros opcionais' })
  @ApiResponse({ status: 200, description: 'Lista paginada de exemplares', type: ListaExemplaresResponseDto })
  @ApiResponse({ status: 400, description: 'Parâmetros de consulta inválidos', type: ErroDto })
  @ApiQuery({ name: 'obraId', required: false, type: String, description: 'Filtrar por obra' })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoExemplar, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'pagina', required: false, type: Number, description: 'Página (padrão: 1)' })
  @ApiQuery({ name: 'limite', required: false, type: Number, description: 'Itens por página (máx. 100, padrão: 20)' })
  async listar(
    @Query('obraId') obraId?: string,
    @Query('estado') estado?: EstadoExemplar,
    @Query('pagina') pagina?: string,
    @Query('limite') limite?: string,
  ): Promise<ListaExemplaresResponseDto> {
    const paginaNum = pagina ? parseInt(pagina, 10) : 1;
    const limiteNum = limite ? parseInt(limite, 10) : 20;

    const { itens, total } = await this.exemplaresService.listar(
      paginaNum,
      limiteNum,
      obraId,
      estado,
    );

    return this.exemplaresService.paraListaResposta(itens, paginaNum, limiteNum, total);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um exemplar pelo id (com título da obra)' })
  @ApiResponse({ status: 200, description: 'Exemplar encontrado', type: ExemplarResposta })
  @ApiResponse({ status: 404, description: 'Exemplar não encontrado', type: ErroDto })
  async obterPorId(@Param('id', ParseUUIDPipe) id: string): Promise<ExemplarResposta> {
    const exemplar = await this.exemplaresService.obterPorId(id);
    return ExemplarResposta.de(exemplar);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um exemplar' })
  @ApiResponse({ status: 200, description: 'Exemplar atualizado com sucesso', type: ExemplarResposta })
  @ApiResponse({ status: 400, description: 'Dados inválidos', type: ErroDto })
  @ApiResponse({ status: 404, description: 'Exemplar ou obra não encontrado', type: ErroDto })
  @ApiResponse({ status: 409, description: 'Conflito de regra de negócio', type: ErroDto })
  async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarExemplarDto,
  ): Promise<ExemplarResposta> {
    const exemplar = await this.exemplaresService.atualizar(id, dto);
    return ExemplarResposta.de(exemplar);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um exemplar' })
  @ApiResponse({ status: 204, description: 'Exemplar removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Exemplar não encontrado', type: ErroDto })
  @ApiResponse({ status: 409, description: 'Conflito de regra de negócio', type: ErroDto })
  async remover(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.exemplaresService.remover(id);
  }
}