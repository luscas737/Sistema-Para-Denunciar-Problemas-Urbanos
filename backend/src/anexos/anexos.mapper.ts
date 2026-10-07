import { Anexo } from './entities/anexo.entity';
import { AnexoResponseDto } from './dto/anexo.dto';

export function paraAnexoDto(anexo: Anexo): AnexoResponseDto {
  return {
    id: anexo.id,
    denunciaId: anexo.denunciaId,
    url: anexo.url,
    tipo: anexo.tipo,
    descricao: anexo.descricao,
    enviadoPorId: anexo.enviadoPorId,
    criadoEm: anexo.criadoEm,
  };
}