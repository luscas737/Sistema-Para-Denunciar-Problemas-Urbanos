import { ObraResponseDto, ListaObrasResponseDto } from './dto/obra.dto';
import { Obra } from './entities/obra.entity';

export function paraObraDto(obra: Obra): ObraResponseDto {
  return {
    id: obra.id,
    titulo: obra.titulo,
    isbn: obra.isbn,
    anoPublicacao: obra.anoPublicacao,
    autorId: obra.autorId,
    autor: obra.autor
      ? { id: obra.autor.id, nome: obra.autor.nome }
      : null,
    criadoEm: obra.criadoEm,
    atualizadoEm: obra.atualizadoEm,
  };
}

export function paraPaginacaoObras(
  pagina: number,
  limite: number,
  total: number,
): ListaObrasResponseDto {
  return {
    itens: [],
    pagina,
    limite,
    total,
    totalPaginas: limite > 0 ? Math.ceil(total / limite) : 0,
  };
}