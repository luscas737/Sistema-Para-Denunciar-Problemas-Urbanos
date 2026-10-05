import { Encaminhamento } from './encaminhamento.entity';
import { EncaminhamentoResponseDto } from './dto/encaminhamento.dto';

export function paraEncaminhamentoDto(e: Encaminhamento): EncaminhamentoResponseDto {
  return {
    id: e.id,
    denunciaId: e.denunciaId,
    setorDestinoId: e.setorDestinoId,
    enviadoPorId: e.enviadoPorId,
    observacao: e.observacao,
    dataEncaminhamento: e.dataEncaminhamento,
    aceite: e.aceite,
  };
}

export function paraPaginacao(pagina: number, limite: number, total: number) {
  return {
    pagina,
    limite,
    total,
    totalPaginas: Math.ceil(total / limite),
  };
}
