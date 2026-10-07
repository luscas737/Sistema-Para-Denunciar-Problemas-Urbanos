import { tipoDe } from '../usuarios/usuarios.mapper';
import { HistoricoStatusResponseDto } from './dto/historico.dto';
import { HistoricoStatus } from './entities/historico-status.entity';

export function paraHistoricoDto(h: HistoricoStatus): HistoricoStatusResponseDto {
  return {
    id: h.id,
    denunciaId: h.denunciaId,
    statusAnterior: h.statusAnterior,
    statusAtual: h.statusAtual,
    alteradoPorId: h.alteradoPorId,
    alteradoPorTipo: h.alteradoPor ? tipoDe(h.alteradoPor) : null,
    comentario: h.comentario,
    dataAlteracao: h.dataAlteracao,
  };
}