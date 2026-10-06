import { Injectable } from '@nestjs/common';

@Injectable()
export class AnexosService {
  private anexos: any[] = [];

  criarAnexo(anexo: any) {
    this.anexos.push(anexo);
    return anexo;
  }

  listarAnexos(denunciaId: string) {
    return this.anexos.filter(
      (anexo) => anexo.denunciaId === denunciaId,
    );
  }

  excluirAnexo(anexoId: string) {
    this.anexos = this.anexos.filter(
      (anexo) => anexo.id !== anexoId,
    );

    return {
      mensagem: 'Anexo excluído',
    };
  }
}