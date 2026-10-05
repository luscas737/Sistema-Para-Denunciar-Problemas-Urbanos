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
} from './dto/setor.dto';
import { Setor } from './setores.entity';

export interface ResultadoListagemSetores {
  itens: Setor[];
  total: number;
}

@Injectable()
export class SetoresService {
  constructor(
    @InjectRepository(Setor)
    private readonly setores: Repository<Setor>,
  ) {}

  async criar(dto: CriarSetorDto): Promise<Setor> {
    await this.garantirNomeUnico(dto.nome);

    const setor = this.setores.create({
      nome: dto.nome.trim(),
      descricao: dto.descricao?.trim() ?? null,
      email: dto.email?.trim().toLowerCase() ?? null,
      ativo: dto.ativo ?? true,
    });
    return this.setores.save(setor);
  }

async listar(filtros: ListarSetoresQueryDto): Promise<{ itens: Setor[]; total: number }> {
  const where: FindOptionsWhere<Setor> = {};
  if (!filtros.incluirInativos) where.ativo = true;

  const [itens, total] = await this.setores.findAndCount({
    where,
    order: { nome: 'ASC' },
    skip: (filtros.pagina - 1) * filtros.limite,
    take: filtros.limite,
  });

  return { itens, total };
}

  async obterPorId(id: string): Promise<Setor> {
    const setor = await this.setores.findOneBy({ id });
    if (!setor) {
      throw new NotFoundException(`Setor com id ${id} não encontrado.`);
    }
    return setor;
  }

  /**
   * Usado pelo EncaminhamentoService: garante que o setor existe E está ativo.
   * Regra da seção 6.4 do planejamento.
   */
  async obterAtivoParaEncaminhamento(id: string): Promise<Setor> {
    const setor = await this.obterPorId(id);
    if (!setor.ativo) {
      throw new ConflictException(
        `O setor "${setor.nome}" está inativo e não pode receber encaminhamentos.`,
      );
    }
    return setor;
  }

  async atualizar(id: string, dto: AtualizarSetorDto): Promise<Setor> {
    const setor = await this.obterPorId(id);

    if (dto.nome !== undefined && dto.nome.trim() !== setor.nome) {
      await this.garantirNomeUnico(dto.nome);
      setor.nome = dto.nome.trim();
    }
    if (dto.descricao !== undefined) {
      setor.descricao = dto.descricao?.trim() ?? null;
    }
    if (dto.email !== undefined) {
      setor.email = dto.email?.trim().toLowerCase() ?? null;
    }
    if (dto.ativo !== undefined) {
      setor.ativo = dto.ativo;
    }

    return this.setores.save(setor);
  }

  /**
   * Desativa em vez de apagar (política da seção 5.3: Encaminhamento → Setor é RESTRICT).
   * Manter o histórico de encaminhamentos exige que o setor continue existindo.
   */
  async desativar(id: string): Promise<Setor> {
    const setor = await this.obterPorId(id);
    if (!setor.ativo) return setor;

    setor.ativo = false;
    return this.setores.save(setor);
  }

  private async garantirNomeUnico(nome: string): Promise<void> {
    const existentes = await this.setores.count({
      where: { nome: nome.trim() },
    });
    if (existentes > 0) {
      throw new ConflictException(`Já existe um setor com o nome "${nome.trim()}".`);
    }
  }
}
