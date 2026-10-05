import { Setor } from './setores.entity';
import { SetorResponseDto } from './dto/setor.dto';

export function paraSetorDto(setor: Setor): SetorResponseDto {
  return {
    id: setor.id,
    nome: setor.nome,
    descricao: setor.descricao,
    email: setor.email,
    ativo: setor.ativo,
    criadoEm: setor.criadoEm,
    atualizadoEm: setor.atualizadoEm,
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
