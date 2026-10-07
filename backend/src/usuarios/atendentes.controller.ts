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
import {
  AtualizarAtendenteDto,
  AtendenteResponseDto,
  CriarAtendenteDto,
  ListarUsuariosQueryDto,
} from './dto/usuario.dto';
import { paraAtendenteDto } from './usuarios.mapper';
import { UsuariosService } from './usuarios.service';

@ApiTags('atendentes')
@ApiHeader({
  name: CABECALHO_TIPO_USUARIO,
  required: false,
  description: 'Tipo do usuário: cidadao (padrão), atendente ou administrador',
})
@UseGuards(TipoUsuarioGuard)
@Controller('atendentes')
@ApiResponse({ status: 400, type: ErroDto, description: 'Dados inválidos' })
@ApiResponse({ status: 403, type: ErroDto, description: 'Tipo de usuário sem permissão' })
export class AtendentesController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @TiposPermitidos(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Cadastra um atendente (administrador)' })
  @ApiResponse({ status: 201, type: AtendenteResponseDto, description: 'Atendente cadastrado' })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Setor de lotação não encontrado' })
  @ApiResponse({ status: 409, type: ErroDto, description: 'E-mail ou matrícula já cadastrado' })
  async criar(@Body() dto: CriarAtendenteDto): Promise<AtendenteResponseDto> {
    return paraAtendenteDto(await this.usuariosService.criarAtendente(dto));
  }

  @Get()
  @TiposPermitidos(TipoUsuario.ATENDENTE, TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Lista atendentes (atendente ou administrador)' })
  @ApiResponse({ status: 200, type: [AtendenteResponseDto] })
  async listar(@Query() filtros: ListarUsuariosQueryDto): Promise<AtendenteResponseDto[]> {
    const atendentes = await this.usuariosService.listarAtendentes({
      ativo: filtros.ativo,
      nome: filtros.nome,
    });
    return atendentes.map(paraAtendenteDto);
  }

  @Get(':id')
  @TiposPermitidos(TipoUsuario.ATENDENTE, TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Busca um atendente pelo id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: AtendenteResponseDto })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Atendente não encontrado' })
  async obter(@Param('id', ParseUUIDPipe) id: string): Promise<AtendenteResponseDto> {
    return paraAtendenteDto(await this.usuariosService.obterAtendente(id));
  }

  @Patch(':id')
  @TiposPermitidos(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Atualiza um atendente (administrador)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: AtendenteResponseDto })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Atendente ou setor não encontrado' })
  @ApiResponse({ status: 409, type: ErroDto, description: 'E-mail ou matrícula já cadastrado' })
  async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarAtendenteDto,
  ): Promise<AtendenteResponseDto> {
    return paraAtendenteDto(await this.usuariosService.atualizarAtendente(id, dto));
  }

  @Delete(':id')
  @TiposPermitidos(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Desativa um atendente (sem exclusão física)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: AtendenteResponseDto, description: 'Atendente desativado' })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Atendente não encontrado' })
  async desativar(@Param('id', ParseUUIDPipe) id: string): Promise<AtendenteResponseDto> {
    return paraAtendenteDto(await this.usuariosService.desativarAtendente(id));
  }
}