import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DenunciasService } from './denuncias.service';
import { Denuncia } from './entities/denuncia.entity';
import { CreateDenunciaDto, UpdateDenunciaDto } from './dto/denuncia.dto';

@ApiTags('denuncias')
@Controller('denuncias')
export class DenunciasController {
  constructor(private readonly denunciasService: DenunciasService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra uma denúncia' })
  criar(@Body() dto: CreateDenunciaDto): Promise<Denuncia> {
    return this.denunciasService.criar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista denúncias, com filtros por categoria e status' })
  listar(@Query() filtros: { categoria?: string; status?: string }): Promise<Denuncia[]> {
    return this.denunciasService.listar(filtros);
  }

  @Get('mapa')
  @ApiOperation({ summary: 'Lista denúncias para exibição no mapa' })
  listarParaMapa(@Query() filtros: { categoria?: string; status?: string }): Promise<Denuncia[]> {
    return this.denunciasService.listar(filtros);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma denúncia pelo id' })
  obterPorId(@Param('id', ParseUUIDPipe) id: string): Promise<Denuncia> {
    return this.denunciasService.obterPorId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma denúncia' })
  atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDenunciaDto,
  ): Promise<Denuncia> {
    return this.denunciasService.atualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma denúncia' })
  remover(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.denunciasService.remover(id);
  }
}
