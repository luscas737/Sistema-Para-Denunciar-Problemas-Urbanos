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
  AdministradorResponseDto,
  AtualizarAdministradorDto,
  CriarAdministradorDto,
  ListarUsuariosQueryDto,
} from './dto/usuario.dto';
import { paraAdministradorDto } from './usuarios.mapper';
import { UsuariosService } from './usuarios.service';

@ApiTags('administradores')
@ApiHeader({
  name: CABECALHO_TIPO_USUARIO,
  required: false,
  description: 'Tipo do usuário: cidadao (padrão), atendente ou administrador',
})
@UseGuards(TipoUsuarioGuard)
@Controller('administradores')
@ApiResponse({ status: 400, type: ErroDto, description: 'Dados inválidos' })
@ApiResponse({ status: 403, type: ErroDto, description: 'Tipo de usuário sem permissão' })
export class AdministradoresController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @TiposPermitidos(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Cadastra um administrador (administrador)', description: 'nivelAcesso: 1 = padrão; 2 = pode reabrir denúncia resolvida.' })
  @ApiResponse({ status: 201, type: AdministradorResponseDto, description: 'Administrador cadastrado' })
  @ApiResponse({ status: 409, type: ErroDto, description: 'E-mail já cadastrado' })
  async criar(@Body() dto: CriarAdministradorDto): Promise<AdministradorResponseDto> {
    return paraAdministradorDto(await this.usuariosService.criarAdministrador(dto));
  }

  @Get()
  @TiposPermitidos(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Lista administradores (apenas administrador)' })
  @ApiResponse({ status: 200, type: [AdministradorResponseDto] })
  async listar(@Query() filtros: ListarUsuariosQueryDto): Promise<AdministradorResponseDto[]> {
    const administradores = await this.usuariosService.listarAdministradores({
      ativo: filtros.ativo,
      nome: filtros.nome,
    });
    return administradores.map(paraAdministradorDto);
  }

  @Get(':id')
  @TiposPermitidos(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Busca um administrador pelo id' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: AdministradorResponseDto })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Administrador não encontrado' })
  async obter(@Param('id', ParseUUIDPipe) id: string): Promise<AdministradorResponseDto> {
    return paraAdministradorDto(await this.usuariosService.obterAdministrador(id));
  }

  @Patch(':id')
  @TiposPermitidos(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Atualiza um administrador (administrador)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: AdministradorResponseDto })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Administrador não encontrado' })
  @ApiResponse({ status: 409, type: ErroDto, description: 'E-mail já cadastrado' })
  async atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarAdministradorDto,
  ): Promise<AdministradorResponseDto> {
    return paraAdministradorDto(await this.usuariosService.atualizarAdministrador(id, dto));
  }

  @Delete(':id')
  @TiposPermitidos(TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Desativa um administrador (sem exclusão física)' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: AdministradorResponseDto, description: 'Administrador desativado' })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Administrador não encontrado' })
  async desativar(@Param('id', ParseUUIDPipe) id: string): Promise<AdministradorResponseDto> {
    return paraAdministradorDto(await this.usuariosService.desativarAdministrador(id));
  }
}