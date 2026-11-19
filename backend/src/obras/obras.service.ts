import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindOptionsWhere,
  ILike,
  IsNull,
  LessThan,
  Repository,
} from 'typeorm';
import { Autor } from './entities/autor.entity';
import { Obra } from './entities/obra.entity';
import { Exemplar, EstadoExemplar } from './entities/exemplar.entity';
import {
  AtualizarObraDto,
  CriarObraDto,
  ListarObrasQueryDto,
} from './dto/obra.dto';

export interface ResultadoListagemObras {
  itens: Obra[];
  total: number;
}

@Injectable()
export class ObrasService {
  constructor(
    @InjectRepository(Obra)
    private readonly obras: Repository<Obra>,
    @InjectRepository(Autor)
    private readonly autores: Repository<Autor>,
    @InjectRepository(Exemplar)
    private readonly exemplares: Repository<Exemplar>,
    private readonly dataSource: DataSource,
  ) {}

  /* =====================================================================
     CRUD — Create
     ===================================================================== */
  async criar(dto: CriarObraDto): Promise<Obra> {
    const autor = await this.autores.findOneBy({ id: dto.autorId });
    if (!autor) {
      throw new NotFoundException(`Autor com id ${dto.autorId} não encontrado.`);
    }

    const obra = this.obras.create({
      titulo: dto.titulo.trim(),
      isbn: dto.isbn ?? null,
      anoPublicacao: dto.anoPublicacao ?? null,
      autorId: dto.autorId,
    });

    return this.obras.save(obra);
  }

  /* =====================================================================
     CRUD — Read (listagem paginada)
     ===================================================================== */
  async listar(
    filtros: ListarObrasQueryDto,
  ): Promise<ResultadoListagemObras> {
    const where: FindOptionsWhere<Obra> = {};

    if (filtros.q) {
      where.titulo = ILike(`%${filtros.q}%`);
    }
    if (filtros.autorId) {
      where.autorId = filtros.autorId;
    }

    const [itens, total] = await this.obras.findAndCount({
      where,
      relations: ['autor'],
      order: { criadoEm: 'DESC' },
      skip: (filtros.pagina - 1) * filtros.limite,
      take: filtros.limite,
    });

    return { itens, total };
  }

  /* =====================================================================
     CRUD — Read (um item com relations)
     ===================================================================== */
  async obterPorId(id: string): Promise<Obra> {
    const obra = await this.obras.findOne({
      where: { id },
      relations: ['autor', 'exemplares'],
    });
    if (!obra) {
      throw new NotFoundException(`Obra com id ${id} não encontrada.`);
    }
    return obra;
  }

  /* =====================================================================
     CRUD — Update
     ===================================================================== */
  async atualizar(id: string, dto: AtualizarObraDto): Promise<Obra> {
    const obra = await this.obterPorId(id);

    if (dto.titulo !== undefined) obra.titulo = dto.titulo.trim();
    if (dto.isbn !== undefined) obra.isbn = dto.isbn ?? null;
    if (dto.anoPublicacao !== undefined)
      obra.anoPublicacao = dto.anoPublicacao ?? null;
    if (dto.autorId !== undefined) {
      const autor = await this.autores.findOneBy({ id: dto.autorId });
      if (!autor) {
        throw new NotFoundException(
          `Autor com id ${dto.autorId} não encontrado.`,
        );
      }
      obra.autorId = dto.autorId;
    }

    return this.obras.save(obra);
  }

  /* =====================================================================
     CRUD — Delete
     ===================================================================== */
  async remover(id: string): Promise<void> {
    const obra = await this.obterPorId(id);
    await this.obras.remove(obra);
  }

  /* =====================================================================
     E06.2 — N+1: versão ruim (autor buscado dentro de laço)
     ===================================================================== */
  async listar50Nmais1(): Promise<{ itens: Obra[]; consultas: number }> {
    const obras = await this.obras.find({
      take: 50,
      order: { criadoEm: 'DESC' },
    }); // 1 consulta

    let consultas = 1;
    for (const obra of obras) {
      await this.autores.findOneBy({ id: obra.autorId }); // 1 consulta por obra
      consultas += 1;
    }

    return { itens: obras, consultas };
  }

  /* =====================================================================
     E06.2 — N+1: versão boa (relations)
     ===================================================================== */
  async listar50ComRelations(): Promise<{ itens: Obra[]; consultas: number }> {
    const [itens] = await this.obras.findAndCount({
      relations: ['autor'], // 1 consulta com JOIN
      take: 50,
      order: { criadoEm: 'DESC' },
    }); // 1 consulta

    return { itens, consultas: 1 };
  }

  /* =====================================================================
     E06.1 — 8 consultas com Repository
     ===================================================================== */

  // 1. Obras publicadas antes de 1900, por título
  async obrasAntesDe1900(): Promise<Obra[]> {
    return this.obras.find({
      where: { anoPublicacao: LessThan(1900) },
      order: { titulo: 'ASC' },
      relations: ['autor'],
    });
  }

  // 2. Obras cujo título contém "sertão", sem diferenciar maiúsculas
  async obrasComSertao(): Promise<Obra[]> {
    return this.obras.find({
      where: { titulo: ILike('%sertão%') },
      order: { titulo: 'ASC' },
    });
  }

  // 3. Obras de um autor específico, com o autor carregado
  async obrasDeAutor(autorId: string): Promise<Obra[]> {
    return this.obras.find({
      where: { autorId },
      relations: ['autor'],
      order: { titulo: 'ASC' },
    });
  }

  // 4. Exemplares em estado DESGASTADO ou DESCARTADO
  async exemplaresDesgastadoOuDescartado(): Promise<Exemplar[]> {
    return this.exemplares.find({
      where: [
        { estado: EstadoExemplar.DESGASTADO },
        { estado: EstadoExemplar.DESCARTADO },
      ],
      relations: ['obra'],
      order: { estado: 'ASC', tombo: 'ASC' },
    });
  }

  // 5. Obras SEM ISBN cadastrado
  async obrasSemIsbn(): Promise<Obra[]> {
    return this.obras.find({
      where: { isbn: IsNull() },
      order: { titulo: 'ASC' },
      relations: ['autor'],
    });
  }

  // 6. As 10 obras mais recentes
  async dezMaisRecentes(): Promise<Obra[]> {
    return this.obras.find({
      order: { criadoEm: 'DESC' },
      take: 10,
      relations: ['autor'],
    });
  }

  // 7. Obras de qualquer autor cujo nome comece com "Machado"
  async obrasAutorMachado(): Promise<Obra[]> {
    return this.obras.find({
      where: { autor: { nome: ILike('Machado%') } },
      relations: ['autor'],
      order: { titulo: 'ASC' },
    });
  }

  // 8. Total de obras cadastradas (só a contagem)
  async totalObras(): Promise<number> {
    return this.obras.count();
  }

  /* =====================================================================
     E06.3 — Relatórios com QueryBuilder
     ===================================================================== */

  // 1. Quantas obras por autor, só quem tem mais de 3, do maior para o menor
  async relatorioObrasPorAutor(): Promise<any[]> {
    const qb = this.obras
      .createQueryBuilder('obra')
      .select('autor.nome', 'autor')
      .addSelect('COUNT(obra.id)', 'totalObras')
      .innerJoin('obra.autor', 'autor')
      .groupBy('autor.id')
      .groupBy('autor.nome')
      .having('COUNT(obra.id) > 3')
      .orderBy('totalObras', 'DESC');
    return qb.getRawMany();
  }

  // 2. Quantos exemplares por estado
  async relatorioExemplaresPorEstado(): Promise<any[]> {
    const qb = this.exemplares
      .createQueryBuilder('exemplar')
      .select('exemplar.estado', 'estado')
      .addSelect('COUNT(exemplar.id)', 'total')
      .groupBy('exemplar.estado')
      .orderBy('total', 'DESC');
    return qb.getRawMany();
  }

  // 3. Autores sem nenhuma obra cadastrada — LEFT JOIN … IS NULL
  async autoresSemObraLeftJoin(): Promise<any[]> {
    const qb = this.autores
      .createQueryBuilder('autor')
      .leftJoin('autor.obras', 'obra')
      .where('obra.id IS NULL')
      .select('autor.id', 'id')
      .addSelect('autor.nome', 'nome');
    return qb.getRawMany();
  }

  // 3b. Mesma consulta com NOT IN (para comparação de performance)
  async autoresSemObraNotIn(): Promise<any[]> {
    const qb = this.autores
      .createQueryBuilder('autor')
      .where('autor.id NOT IN (SELECT obra.autorId FROM obras obra)')
      .select('autor.id', 'id')
      .addSelect('autor.nome', 'nome');
    return qb.getRawMany();
  }

  // 4. Obras com pelo menos um exemplar disponível
  async obrasComExemplarDisponivel(): Promise<any[]> {
    const qb = this.obras
      .createQueryBuilder('obra')
      .innerJoin('obra.exemplares', 'exemplar')
      .where('exemplar.estado = :estado', {
        estado: EstadoExemplar.DISPONIVEL,
      })
      .select('obra.id', 'id')
      .addSelect('obra.titulo', 'titulo')
      .distinct(true);
    return qb.getRawMany();
  }
}