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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ObrasService } from './obras.service';
import {
  AtualizarObraDto,
  CriarObraDto,
  ListarObrasQueryDto,
  ListaObrasResponseDto,
  ObraResponseDto,
} from './dto/obra.dto';
import { ErroDto } from '../common/dto/erro.dto';

@ApiTags('obras')
@Controller('obras')
export class ObrasController {
  constructor(private readonly obrasService: ObrasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastra uma obra' })
  @ApiResponse({ status: 201, description: 'Obra criada com sucesso', type: ObraResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos', type: ErroDto })
  @ApiResponse({ status: 404, description: 'Autor não encontrado', type: ErroDto })
  @ApiResponse({ status: 409, description: 'Conflito de regra de negócio', type: ErroDto })
  async criar(@Body() dto: CriarObraDto): Promise<ObraResponseDto> {
    const obra = await this.obrasService.criar(dto);
    return ObraResponseDto.de(obra);
  }

  @Get()
  @ApiOperation({ summary: 'Lista obras com paginação e filtros opcionais' })
  @ApiResponse({ status: 200, description: 'Lista paginada de obras', type: ListaObrasResponseDto })
  @ApiResponse({ status: 400, description: 'Parâmetros de consulta inválidos', type: ErroDto })
  async listar(@Query() filtros: ListarObrasQueryDto): Promise<ListaObrasResponseDto> {
    const pagina = filtros.pagina ?? 1;
    const limite = filtros.limite ?? 20;
    const { itens, total } = await this.obrasService.listar({
      ...filtros,
      pagina,
      limite,
    });
    return {
      itens: itens.map((obra) => ObraResponseDto.de(obra)),
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma obra pelo id (com autor e exemplares)' })
  @ApiResponse({ status: 200, description: 'Obra encontrada', type: ObraResponseDto })
  @ApiResponse({ status: 404, description: 'Obra não encontrada', type: ErroDto })
  async obterPorId(@Param('id', ParseUUIDPipe) id: string): Promise<ObraResponseDto> {
    const obra = await this.obrasService.obterPorId(id);
    return ObraResponseDto.de(obra);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma obra' })
  @ApiResponse({ status: 200, description: 'Obra atualizada com sucesso', type: ObraResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos', type: ErroDto })
  @ApiResponse({ status: 404, description: 'Obra não encontrada', type: ErroDto })
  @ApiResponse({ status: 409, description: 'Conflito de regra de negócio', type: ErroDto })
  async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarObraDto,
  ): Promise<ObraResponseDto> {
    const obra = await this.obrasService.atualizar(id, dto);
    return ObraResponseDto.de(obra);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove uma obra' })
  @ApiResponse({ status: 204, description: 'Obra removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Obra não encontrada', type: ErroDto })
  @ApiResponse({ status: 409, description: 'Conflito de regra de negócio', type: ErroDto })
  async remover(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.obrasService.remover(id);
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