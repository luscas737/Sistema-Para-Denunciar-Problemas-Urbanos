import { DenunciaResponseDto, PaginacaoDto } from './dto/denuncia.dto';
import { Denuncia } from './entities/denuncia.entity';
import { CategoriaDenuncia } from './denuncia.enums';

export function paraDenunciaDto(denuncia: Denuncia): DenunciaResponseDto {
  return {
    id: denuncia.id,
    titulo: denuncia.titulo,
    descricao: denuncia.descricao,
    categoria: denuncia.categoria as CategoriaDenuncia,
    latitude: denuncia.latitude,
    longitude: denuncia.longitude,
    status: denuncia.status,
    cidadaoId: denuncia.cidadaoId ?? null,
    setorAtualId: denuncia.setorAtualId ?? null,
    setorAtual: denuncia.setorAtual
      ? { id: denuncia.setorAtual.id, nome: denuncia.setorAtual.nome }
      : null,
    categorias: denuncia.categorias?.map((dc) => ({
      id: dc.categoria?.id ?? '',
      nome: dc.categoria?.nome ?? '',
      ehPrincipal: dc.ehPrincipal,
    })) ?? null,
    arquivada: denuncia.arquivada,
    arquivadaEm: denuncia.arquivadaEm ?? null,
    criadoEm: denuncia.criadoEm,
    atualizadoEm: denuncia.atualizadoEm,
  };
}

export function paraPaginacao(
  pagina: number,
  limite: number,
  total: number,
): PaginacaoDto {
  return {
    pagina,
    limite,
    total,
    totalPaginas: limite > 0 ? Math.ceil(total / limite) : 0,
  };
}
