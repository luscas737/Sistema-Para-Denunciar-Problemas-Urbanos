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
import { TiposPermitidos } from '../common/decorators/tipos-usuario.decorator';
import { ErroDto } from '../common/dto/erro.dto';
import { CABECALHO_TIPO_USUARIO, TipoUsuarioGuard } from '../common/guards/tipo-usuario.guard';
import { TipoUsuario } from '../common/tipos-usuario';
import { AtualizarCidadaoDto, CidadaoResponseDto, CriarCidadaoDto, ListarUsuariosQueryDto } from './dto/usuario.dto';
import { paraCidadaoDto } from './usuarios.mapper';
import { UsuariosService } from './usuarios.service';

@ApiTags('cidadaos')
@ApiHeader({
  name: CABECALHO_TIPO_USUARIO,
  required: false,
  description: 'Tipo do usuário: cidadao (padrão), atendente ou administrador',
})
@UseGuards(TipoUsuarioGuard)
@Controller('cidadaos')
@ApiResponse({ status: 400, type: ErroDto, description: 'Dados inválidos' })
@ApiResponse({ status: 403, type: ErroDto, description: 'Tipo de usuário sem permissão' })
export class CidadaosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um cidadão' })
  @ApiResponse({ status: 201, type: CidadaoResponseDto, description: 'Cidadão cadastrado' })
  @ApiResponse({ status: 409, type: ErroDto, description: 'E-mail ou CPF já cadastrado' })
  async criar(@Body() dto: CriarCidadaoDto): Promise<CidadaoResponseDto> {
    return paraCidadaoDto(await this.usuariosService.criarCidadao(dto));
  }

  @Get()
  @TiposPermitidos(TipoUsuario.ATENDENTE, TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Lista cidadãos (atendente ou administrador)' })
  @ApiResponse({ status: 200, type: [CidadaoResponseDto] })
  async listar(@Query() filtros: ListarUsuariosQueryDto): Promise<CidadaoResponseDto[]> {
    const cidadaos = await this.usuariosService.listarCidadaos({
      ativo: filtros.ativo,
      nome: filtros.nome,
    });
    return cidadaos.map(paraCidadaoDto);
  }

  @Get(':id')
  @TiposPermitidos(TipoUsuario.ATENDENTE, TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Busca um cidadão pelo id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: CidadaoResponseDto })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Cidadão não encontrado' })
  async obter(@Param('id', ParseUUIDPipe) id: string): Promise<CidadaoResponseDto> {
    return paraCidadaoDto(await this.usuariosService.obterCidadao(id));
  }

  @Patch(':id')
  @TiposPermitidos(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Atualiza um cidadão (administrador)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: CidadaoResponseDto })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Cidadão não encontrado' })
  @ApiResponse({ status: 409, type: ErroDto, description: 'E-mail ou CPF já cadastrado' })
  async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarCidadaoDto,
  ): Promise<CidadaoResponseDto> {
    return paraCidadaoDto(await this.usuariosService.atualizarCidadao(id, dto));
  }

  @Delete(':id')
  @TiposPermitidos(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Desativa um cidadão (sem exclusão física)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: CidadaoResponseDto, description: 'Cidadão desativado' })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Cidadão não encontrado' })
  async desativar(@Param('id', ParseUUIDPipe) id: string): Promise<CidadaoResponseDto> {
    return paraCidadaoDto(await this.usuariosService.desativarCidadao(id));
  }
}
