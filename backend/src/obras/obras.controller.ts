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
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ObrasService } from './obras.service';
import { paraObraDto } from './obras.mapper';
import {
  AtualizarObraDto,
  CriarObraDto,
  ListarObrasQueryDto,
  ListaObrasResponseDto,
  ObraResponseDto,
} from './dto/obra.dto';

@ApiTags('obras')
@Controller('obras')
export class ObrasController {
  constructor(private readonly obrasService: ObrasService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra uma obra' })
  @ApiResponse({ status: 201, type: ObraResponseDto })
  async criar(@Body() dto: CriarObraDto): Promise<ObraResponseDto> {
    return paraObraDto(await this.obrasService.criar(dto));
  }

  @Get()
  @ApiOperation({ summary: 'Lista obras com paginação e filtros opcionais' })
  @ApiResponse({ status: 200, type: ListaObrasResponseDto })
  async listar(@Query() filtros: ListarObrasQueryDto): Promise<ListaObrasResponseDto> {
    const { itens, total } = await this.obrasService.listar(filtros);
    return {
      itens: itens.map(paraObraDto),
      pagina: filtros.pagina,
      limite: filtros.limite,
      total,
      totalPaginas: Math.ceil(total / filtros.limite),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma obra pelo id (com autor e exemplares)' })
  @ApiResponse({ status: 200, type: ObraResponseDto })
  @ApiResponse({ status: 404, description: 'Obra não encontrada' })
  async obterPorId(@Param('id', ParseUUIDPipe) id: string): Promise<ObraResponseDto> {
    return paraObraDto(await this.obrasService.obterPorId(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma obra' })
  @ApiResponse({ status: 200, type: ObraResponseDto })
  @ApiResponse({ status: 404, description: 'Obra não encontrada' })
  async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarObraDto,
  ): Promise<ObraResponseDto> {
    return paraObraDto(await this.obrasService.atualizar(id, dto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma obra' })
  @ApiResponse({ status: 200, description: 'Obra removida' })
  @ApiResponse({ status: 404, description: 'Obra não encontrada' })
  async remover(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.obrasService.remover(id);
    return { message: 'Obra removida com sucesso' };
  }

  /* =====================================================================
     Endpoints de diagnóstico para o caderno (N+1 e consultas)
     ===================================================================== */
  @Get('diagnostico/nmais1')
  @ApiOperation({ summary: 'Lista 50 obras com N+1 (versão ruim)' })
  async nmais1() {
    const resultado = await this.obrasService.listar50Nmais1();
    return {
      consultas: resultado.consultas,
      totalObras: resultado.itens.length,
      amostra: resultado.itens.slice(0, 3).map((o) => ({ id: o.id, titulo: o.titulo, autorId: o.autorId })),
    };
  }

  @Get('diagnostico/nmais1-com-relations')
  @ApiOperation({ summary: 'Lista 50 obras com relations (versão boa)' })
  async nmais1ComRelations() {
    const resultado = await this.obrasService.listar50ComRelations();
    return {
      consultas: resultado.consultas,
      totalObras: resultado.itens.length,
      amostra: resultado.itens.slice(0, 3).map((o) => ({ id: o.id, titulo: o.titulo, autor: o.autor })),
    };
  }

  @Get('diagnostico/e061/antes-de-1900')
  async e061AntesDe1900() {
    return this.obrasService.obrasAntesDe1900();
  }

  @Get('diagnostico/e061/sertao')
  async e061Sertao() {
    return this.obrasService.obrasComSertao();
  }

  @Get('diagnostico/e061/sem-isbn')
  async e061SemIsbn() {
    return this.obrasService.obrasSemIsbn();
  }

  @Get('diagnostico/e061/dez-mais-recentes')
  async e061DezMaisRecentes() {
    return this.obrasService.dezMaisRecentes();
  }

  @Get('diagnostico/e061/total')
  async e061Total() {
    return { total: await this.obrasService.totalObras() };
  }

  @Get('diagnostico/e063/obras-por-autor')
  async e063ObrasPorAutor() {
    return this.obrasService.relatorioObrasPorAutor();
  }

  @Get('diagnostico/e063/exemplares-por-estado')
  async e063ExemplaresPorEstado() {
    return this.obrasService.relatorioExemplaresPorEstado();
  }

  @Get('diagnostico/e063/autores-sem-obra-leftjoin')
  async e063AutoresSemObraLeftJoin() {
    return this.obrasService.autoresSemObraLeftJoin();
  }

  @Get('diagnostico/e063/autores-sem-obra-notin')
  async e063AutoresSemObraNotIn() {
    return this.obrasService.autoresSemObraNotIn();
  }

  @Get('diagnostico/e063/obras-com-exemplar-disponivel')
  async e063ObrasComExemplarDisponivel() {
    return this.obrasService.obrasComExemplarDisponivel();
  }
}