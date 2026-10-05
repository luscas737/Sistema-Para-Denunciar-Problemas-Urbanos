import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  AtualizarSetorDto,
  CriarSetorDto,
  ListarSetoresQueryDto,
  ListaSetoresResponseDto,
} from './dto/setor.dto';
import { Setor } from './setores.entity';

@Injectable()
export class SetoresService {
  constructor(
    @InjectRepository(Setor)
    private readonly setores: Repository<Setor>,
  ) {}

  async criar(dto: CriarSetorDto): Promise<Setor> { /* ... igual ... */ }

  // método listar substituído
  async listar(filtros: ListarSetoresQueryDto): Promise<ListaSetoresResponseDto> {
    const where: FindOptionsWhere<Setor> = {};
    if (!filtros.incluirInativos) where.ativo = true;

    const [itens, total] = await this.setores.findAndCount({
      where,
      order: { nome: 'ASC' },
      skip: (filtros.pagina - 1) * filtros.limite,
      take: filtros.limite,
    });

    return {
      itens,
      pagina: filtros.pagina,
      limite: filtros.limite,
      total,
      totalPaginas: Math.ceil(total / filtros.limite),
    };
  }

  async obterPorId(id: string): Promise<Setor> { /* ... igual ... */ }
  async obterAtivoParaEncaminhamento(id: string): Promise<Setor> { /* ... igual ... */ }
  async atualizar(id: string, dto: AtualizarSetorDto): Promise<Setor> { /* ... igual ... */ }
  async desativar(id: string): Promise<Setor> { /* ... igual ... */ }

  private async garantirNomeUnico(nome: string): Promise<void> { /* ... igual ... */ }
}
