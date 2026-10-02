import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TiposPermitidos } from '../common/decorators/tipos-usuario.decorator';
import { ErroDto } from '../common/dto/erro.dto';
import { CABECALHO_TIPO_USUARIO, TipoUsuarioGuard } from '../common/guards/tipo-usuario.guard';
import { TipoUsuario } from '../common/tipos-usuario';
import { ListarUsuariosQueryDto, UsuarioResponseDto } from './dto/usuario.dto';
import { paraUsuarioDto } from './usuarios.mapper';
import { UsuariosService } from './usuarios.service';

@ApiTags('usuarios')
@ApiHeader({
  name: CABECALHO_TIPO_USUARIO,
  required: false,
  description: 'Tipo do usuário: cidadao (padrão), atendente ou administrador',
})
@UseGuards(TipoUsuarioGuard)
@Controller('usuarios')
@ApiResponse({ status: 403, type: ErroDto, description: 'Tipo de usuário sem permissão' })
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @TiposPermitidos(TipoUsuario.ATENDENTE, TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Lista usuários de qualquer tipo, com filtro por tipo, ativo e nome' })
  @ApiResponse({ status: 200, type: [UsuarioResponseDto] })
  async listar(@Query() filtros: ListarUsuariosQueryDto): Promise<UsuarioResponseDto[]> {
    const usuarios = await this.usuariosService.listar(filtros);
    return usuarios.map(paraUsuarioDto);
  }

  @Get(':id')
  @TiposPermitidos(TipoUsuario.ATENDENTE, TipoUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Busca um usuário pelo id, em qualquer tipo' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: UsuarioResponseDto })
  @ApiResponse({ status: 404, type: ErroDto, description: 'Usuário não encontrado' })
  async obter(@Param('id', ParseUUIDPipe) id: string): Promise<UsuarioResponseDto> {
    return paraUsuarioDto(await this.usuariosService.obterPorId(id));
  }
}
