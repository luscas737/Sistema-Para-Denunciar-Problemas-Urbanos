import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { AnexosService } from './anexos.service';

@Controller('api/denuncias/:id/anexos')
export class AnexosController {
  constructor(private readonly anexosService: AnexosService) {}

  @Post()
  criarAnexo(
    @Param('id') id: string,
    @Body() anexo: any,
  ) {
    return this.anexosService.criarAnexo({
      ...anexo,
      denunciaId: id,
    });
  }

  @Get()
  listarAnexos(@Param('id') id: string) {
    return this.anexosService.listarAnexos(id);
  }

  @Delete(':anexoId')
  excluirAnexo(@Param('anexoId') anexoId: string) {
    return this.anexosService.excluirAnexo(anexoId);
  }
}