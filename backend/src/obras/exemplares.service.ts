import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Obra } from './entities/obra.entity';
import { Exemplar, EstadoExemplar } from './entities/exemplar.entity';
import {
  AtualizarExemplarDto,
  CriarExemplarDto,
  ExemplarResposta,
  ListaExemplaresResponseDto,
} from './dto/exemplar.dto';

export interface ResultadoListagemExemplares {
  itens: Exemplar[];
  total: number;
}

@Injectable()
export class ExemplaresService {
  constructor(
    @InjectRepository(Exemplar)
    private readonly exemplares: Repository<Exemplar>,
    @InjectRepository(Obra)
    private readonly obras: Repository<Obra>,
  ) {}

  /* =====================================================================
     CRUD — Create
     ===================================================================== */
  async criar(dto: CriarExemplarDto): Promise<Exemplar> {
    const obra = await this.obras.findOneBy({ id: dto.obraId });
    if (!obra) {
      throw new NotFoundException(`Obra com id ${dto.obraId} não encontrada.`);
    }

    // Regra de negócio: data de aquisição não pode ser futura (E07.3)
    if (dto.dataAquisicao) {
      const dataAquisicao = new Date(dto.dataAquisicao);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      if (dataAquisicao > hoje) {
        throw new BadRequestException(
          'A data de aquisição não pode ser futura.',
        );
      }
    }

    const exemplar = this.exemplares.create({
      tombo: dto.tombo.toUpperCase(),
      estado: dto.estado,
      obraId: dto.obraId,
      dataAquisicao: dto.dataAquisicao
        ? new Date(dto.dataAquisicao)
        : null,
    });

    const salvo = await this.exemplares.save(exemplar);
    const resultado = await this.exemplares.findOne({
      where: { id: salvo.id },
      relations: ['obra'],
    });
    if (!resultado) {
      throw new NotFoundException(`Exemplar com id ${salvo.id} não encontrado após criação.`);
    }
    return resultado;
  }

  /* =====================================================================
     CRUD — Read (listagem paginada)
     ===================================================================== */
  async listar(
    pagina: number,
    limite: number,
    obraId?: string,
    estado?: EstadoExemplar,
  ): Promise<ResultadoListagemExemplares> {
    const where: Record<string, unknown> = {};
    if (obraId) where.obraId = obraId;
    if (estado) where.estado = estado;

    const [itens, total] = await this.exemplares.findAndCount({
      where,
      relations: ['obra'],
      order: { criadoEm: 'DESC' },
      skip: (pagina - 1) * limite,
      take: limite,
    });

    return { itens, total };
  }

  /* =====================================================================
     CRUD — Read (um item)
     ===================================================================== */
  async obterPorId(id: string): Promise<Exemplar> {
    const exemplar = await this.exemplares.findOne({
      where: { id },
      relations: ['obra'],
    });
    if (!exemplar) {
      throw new NotFoundException(`Exemplar com id ${id} não encontrado.`);
    }
    return exemplar;
  }

  /* =====================================================================
     CRUD — Update
     ===================================================================== */
  async atualizar(id: string, dto: AtualizarExemplarDto): Promise<Exemplar> {
    const exemplar = await this.obterPorId(id);

    // Regra de negócio: exemplar descartado não pode ser reativado (E07.3 / 409)
    if (exemplar.estado === EstadoExemplar.DESCARTADO && dto.estado !== undefined && dto.estado !== EstadoExemplar.DESCARTADO) {
      throw new ConflictException(
        `Exemplar ${exemplar.tombo} está descartado e não pode ser alterado para ${dto.estado}.`,
      );
    }

    if (dto.tombo !== undefined) {
      exemplar.tombo = dto.tombo.toUpperCase();
    }
    if (dto.estado !== undefined) {
      exemplar.estado = dto.estado;
    }
    if (dto.obraId !== undefined) {
      const obra = await this.obras.findOneBy({ id: dto.obraId });
      if (!obra) {
        throw new NotFoundException(`Obra com id ${dto.obraId} não encontrada.`);
      }
      exemplar.obraId = dto.obraId;
    }
    if (dto.dataAquisicao !== undefined) {
      const dataAquisicao = new Date(dto.dataAquisicao);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      if (dataAquisicao > hoje) {
        throw new BadRequestException(
          'A data de aquisição não pode ser futura.',
        );
      }
      exemplar.dataAquisicao = dataAquisicao;
    }

    const salvo = await this.exemplares.save(exemplar);
    const resultado = await this.exemplares.findOne({
      where: { id: salvo.id },
      relations: ['obra'],
    });
    if (!resultado) {
      throw new NotFoundException(`Exemplar com id ${salvo.id} não encontrado após atualização.`);
    }
    return resultado;
  }

  /* =====================================================================
     CRUD — Delete
     ===================================================================== */
  async remover(id: string): Promise<void> {
    const exemplar = await this.obterPorId(id);
    await this.exemplares.remove(exemplar);
  }

  /* =====================================================================
     Mapeamento para resposta
     ===================================================================== */
  paraListaResposta(
    itens: Exemplar[],
    pagina: number,
    limite: number,
    total: number,
  ): ListaExemplaresResponseDto {
    return {
      itens: itens.map((e) => ExemplarResposta.de(e)),
      pagina,
      limite,
      total,
      totalPaginas: Math.ceil(total / limite),
    };
  }
}