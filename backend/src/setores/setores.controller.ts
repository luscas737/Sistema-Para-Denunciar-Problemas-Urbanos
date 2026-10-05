import {
  Body,
  Controller,
  Get,
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
  TipoUsuarioGuard,
} from '../common/guards/tipo-usuario.guard';
import { TipoUsuario } from '../common/tipos-usuario';
import { paraSetorDto, paraPaginacao } from './setores.mapper';
import {
  AtualizarSetorDto,
  CriarSetorDto,
  ListaSetoresResponseDto,
  ListarSetoresQueryDto,
  SetorResponseDto,
} from './dto/setor.dto';
import { SetoresService } from './setores.service';

@ApiTags('setores')
@ApiHeader({
  name: CABECALHO_TIPO_USUARIO,
  required: false,
  description: 'Tipo do usuário: cidadao (padrão), atendente ou administrador',
})
@UseGuards(TipoUsuarioGuard)
@Controller('setores')
@ApiResponse({ status: 400, type: ErroDto, description: 'Dados inválidos' })
export class SetoresController {
  constructor(private readonly setoresService: SetoresService) {}

  @Post()
  @TiposPermitidos(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Cadastra um setor (apenas administrador)' })
  @ApiResponse({ status: 201, type: SetorResponseDto, description: 'Setor cadastrado' })
  @ApiResponse({ status: 409, type: ErroDto, description: 'Já existe setor com este nome' })
  async criar(@Body() dto: CriarSetorDto): Promise<SetorResponseDto> {
    return paraSetorDto(await this.setoresService.criar(dto));
  }

@Get()
@ApiOperation({ summary: 'Lista setores com paginação (inativos ficam fora por padrão)' })
@ApiResponse({ status: 200, type: ListaSetoresResponseDto })
async listar(@Query() filtros: ListarSetoresQueryDto): Promise<ListaSetoresResponseDto> {
  const { itens, total } = await this.setoresService.listar(filtros);
  return {
    ...paraPaginacao(filtros.pagina, filtros.limite, total),
    itens: itens.map(paraSetorDto),
  };
}

  @Get(':id')
  @ApiOperation({ summary: 'Busca um setor pelo id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: SetorResponseDto })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Setor não encontrado' })
  async obterPorId(@Param('id', ParseUUIDPipe) id: string): Promise<SetorResponseDto> {
    return paraSetorDto(await this.setoresService.obterPorId(id));
  }

  @Patch(':id')
  @TiposPermitidos(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Atualiza os dados de um setor (apenas administrador)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: SetorResponseDto })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Setor não encontrado' })
  @ApiResponse({ status: 409, type: ErroDto, description: 'Já existe setor com este nome' })
  async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarSetorDto,
  ): Promise<SetorResponseDto> {
    return paraSetorDto(await this.setoresService.atualizar(id, dto));
  }

  @Patch(':id/desativar')
  @TiposPermitidos(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Desativa um setor',
    description:
      'Não há exclusão física: setores com encaminhamentos precisam existir para preservar o histórico (política RESTRICT).',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: SetorResponseDto, description: 'Setor desativado' })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Setor não encontrado' })
  async desativar(@Param('id', ParseUUIDPipe) id: string): Promise<SetorResponseDto> {
    return paraSetorDto(await this.setoresService.desativar(id));
  }
}