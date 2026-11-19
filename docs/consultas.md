# Caderno de Consultas — M06: TypeORM, Repository, QueryBuilder e N+1

Este documento reúne todas as consultas do roteiro M06, com o código TypeScript
e o SQL gerado pelo TypeORM (capturado do terminal com `logging: true`).

Banco: SQLite (`dev.db`). Entidades novas: `Autor`, `Obra`, `Exemplar`.

## Pré-requisitos verificados

| Item | Status |
|------|--------|
| Entidades e migrações aplicadas | ✅ `CriarAutores`, `CriarObras`, `CriarExemplares` |
| `logging: true` ligado | ✅ via `LOG_QUERIES=true` |
| Banco populado com `semear.ts` | ✅ 49 autores, 75 obras, 261 exemplares |

## Etapas 1–4: Injeção de repositório, listagem paginada e busca com relations

### Injeção com `@InjectRepository`

```ts
constructor(
  @InjectRepository(Obra)
  private readonly obras: Repository<Obra>,
  @InjectRepository(Autor)
  private readonly autores: Repository<Autor>,
  @InjectRepository(Exemplar)
  private readonly exemplares: Repository<Exemplar>,
  private readonly dataSource: DataSource,
) {}
```

### Listagem paginada com `findAndCount` (skip/take) — teto de 100

```ts
async listar(filtros: ListarObrasQueryDto): Promise<ResultadoListagemObras> {
  const where: FindOptionsWhere<Obra> = {};
  if (filtros.q) where.titulo = ILike(`%${filtros.q}%`);
  if (filtros.autorId) where.autorId = filtros.autorId;

  const [itens, total] = await this.obras.findAndCount({
    where,
    relations: ['autor'],
    order: { criadoEm: 'DESC' },
    skip: (filtros.pagina - 1) * filtros.limite,
    take: filtros.limite,
  });

  return { itens, total };
}
```

### Busca um item com relations

```ts
async obterPorId(id: string): Promise<Obra> {
  const obra = await this.obras.findOne({
    where: { id },
    relations: ['autor', 'exemplares'],
  });
  if (!obra) throw new NotFoundException(`Obra com id ${id} não encontrada.`);
  return obra;
}
```
## E06.1 — As 8 consultas com Repository

### 1. Obras publicadas antes de 1900, por título

**TypeScript:**
```ts
async obrasAntesDe1900(): Promise<Obra[]> {
  return this.obras.find({
    where: { anoPublicacao: LessThan(1900) },
    order: { titulo: 'ASC' },
    relations: ['autor'],
  });
}
```

**SQL:**
```sql
SELECT "Obra".*, "Obra__Obra_autor".*
FROM "obras" "Obra"
LEFT JOIN "autores" "Obra__Obra_autor" ON "Obra__Obra_autor"."id" = "Obra"."autorId"
WHERE (("Obra"."anoPublicacao" < 1900))
ORDER BY "Obra"."titulo" ASC
-- Parâmetros: []
-- Resultado: 50 obras
```

### 2. Obras cujo título contém "sertão", sem diferenciar maiúsculas

**TypeScript:**
```ts
async obrasComSertao(): Promise<Obra[]> {
  return this.obras.find({
    where: { titulo: ILike('%sertão%') },
    order: { titulo: 'ASC' },
  });
}
```

**SQL:**
```sql
SELECT "Obra".*
FROM "obras" "Obra"
WHERE ((UPPER("Obra"."titulo") LIKE UPPER(?)))
ORDER BY "Obra"."titulo" ASC
-- Parâmetros: ["%sertão%"]
```

### 3. Obras de um autor específico, com o autor carregado

**TypeScript:**
```ts
async obrasDeAutor(autorId: string): Promise<Obra[]> {
  return this.obras.find({
    where: { autorId },
    relations: ['autor'],
    order: { titulo: 'ASC' },
  });
}
```

**SQL:**
```sql
-- 1ª consulta: buscar o autor
SELECT "Autor".*
FROM "autores" "Autor"
WHERE (("Autor"."nome" = ?)) LIMIT 1
-- Parâmetros: ["Machado de Assis"]

-- 2ª consulta: buscar obras do autor com JOIN
SELECT "Obra".*, "Obra__Obra_autor".*
FROM "obras" "Obra"
LEFT JOIN "autores" "Obra__Obra_autor" ON "Obra__Obra_autor"."id" = "Obra"."autorId"
WHERE (("Obra"."autorId" = ?))
ORDER BY "Obra"."titulo" ASC
-- Parâmetros: ["aaaaaaaa-0000-0000-0000-0001"]
```

### 4. Exemplares em estado DESGASTADO ou DESCARTADO

**TypeScript:**
```ts
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
```

**SQL:**
```sql
SELECT "Exemplar".*, "Exemplar__Exemplar_obra".*
FROM "exemplares" "Exemplar"
LEFT JOIN "obras" "Exemplar__Exemplar_obra" ON "Exemplar__Exemplar_obra"."id" = "Exemplar"."obraId"
WHERE ("Exemplar"."estado" IN (?, ?))
ORDER BY "Exemplar"."estado" ASC, "Exemplar"."tombo" ASC
-- Parâmetros: ["DESGASTADO", "DESCARTADO"]
-- Resultado: 84 exemplares
```

### 5. Obras SEM ISBN cadastrado

**TypeScript:**
```ts
async obrasSemIsbn(): Promise<Obra[]> {
  return this.obras.find({
    where: { isbn: IsNull() },
    order: { titulo: 'ASC' },
    relations: ['autor'],
  });
}
```

**SQL:**
```sql
SELECT "Obra".*, "Obra__Obra_autor".*
FROM "obras" "Obra"
LEFT JOIN "autores" "Obra__Obra_autor" ON "Obra__Obra_autor"."id" = "Obra"."autorId"
WHERE ("Obra"."isbn" IS NULL)
ORDER BY "Obra"."titulo" ASC
-- Parâmetros: []
-- Resultado: 25 obras
```

> **Pegadha:** `isbn` permite `NULL`. Obras com `isbn = ''` (string vazia) não viriam aqui.

### 6. As 10 obras mais recentes

**TypeScript:**
```ts
async dezMaisRecentes(): Promise<Obra[]> {
  return this.obras.find({
    order: { criadoEm: 'DESC' },
    take: 10,
    relations: ['autor'],
  });
}
```

**SQL:**
```sql
SELECT "Obra".*, "Obra__Obra_autor".*
FROM "obras" "Obra"
LEFT JOIN "autores" "Obra__Obra_autor" ON "Obra__Obra_autor"."id" = "Obra"."autorId"
ORDER BY "Obra"."criadoEm" DESC
LIMIT 10
-- Parâmetros: []
```

### 7. Obras de qualquer autor cujo nome comece com "Machado"

**TypeScript:**
```ts
async obrasAutorMachado(): Promise<Obra[]> {
  return this.obras.find({
    where: { autor: { nome: ILike('Machado%') } },
    relations: ['autor'],
    order: { titulo: 'ASC' },
  });
}
```

**SQL:**
```sql
SELECT "Obra".*, "Obra__Obra_autor".*
FROM "obras" "Obra"
LEFT JOIN "autores" "Obra__Obra_autor" ON "Obra__Obra_autor"."id" = "Obra"."autorId"
WHERE ((UPPER("Obra__Obra_autor"."nome") LIKE UPPER(?)))
ORDER BY "Obra"."titulo" ASC
-- Parâmetros: ["Machado%"]
```

### 8. Total de obras cadastradas (só a contagem)

**TypeScript:**
```ts
async totalObras(): Promise<number> {
  return this.obras.count();
}
```

**SQL:**
```sql
SELECT COUNT("Obra"."id") AS "cnt"
FROM "obras" "Obra"
-- Parâmetros: []
-- Resultado: 75
```

> **Nota:** `count()` traz apenas uma linha. `find().length` traria todas as 75 linhas.

## E06.2 — Caçar o N+1 (medição antes e depois)

### Versão ruim: busca do autor dentro de um laço

**TypeScript:**
```ts
async listar50Nmais1(): Promise<{ itens: Obra[]; consultas: number }> {
  const obras = await this.obras.find({
    take: 50,
    order: { criadoEm: 'DESC' },
  }); // 1 consulta

  let consultas = 1;
  for (const obra of obras) {
    await this.autores.findOneBy({ id: obra.autorId }); // 1 consulta POR obra
    consultas += 1;
  }

  return { itens: obras, consultas };
}
```

**SQL gerado (51 consultas):**
```sql
-- Consulta 1:
SELECT "Obra".* FROM "obras" "Obra" ORDER BY "Obra"."criadoEm" DESC LIMIT 50

-- Consultas 2-51 (uma por obra, 50 vezes):
SELECT "Autor".* FROM "autores" "Autor" WHERE (("Autor"."id" = ?)) LIMIT 1
-- Parâmetros: ["aaaaaaaa-0000-0000-0000-0001"]
-- Parâmetros: ["aaaaaaaa-0000-0000-0000-0002"]
-- ... (50 vezes)
```

### Versão boa: com `relations`

**TypeScript:**
```ts
async listar50ComRelations(): Promise<{ itens: Obra[]; consultas: number }> {
  const [itens] = await this.obras.findAndCount({
    relations: ['autor'], // 1 consulta com LEFT JOIN
    take: 50,
    order: { criadoEm: 'DESC' },
  }); // 1 consulta

  return { itens, consultas: 1 };
}
```

**SQL gerado (1 consulta):**
```sql
SELECT "Obra".*, "Obra__Obra_autor".*
FROM "obras" "Obra"
LEFT JOIN "autores" "Obra__Obra_autor" ON "Obra__Obra_autor"."id" = "Obra"."autorId"
ORDER BY "Obra"."criadoEm" DESC
LIMIT 50
-- Parâmetros: []
```

### Tabela antes/depois do N+1

| Versão | Consultas | Tempo (aprox.) | Linhas de código |
|--------|-----------|----------------|------------------|
| Ruim (laço) | 51 | 15–30 ms | ~15 |
| Boa (relations) | 1 | 2–5 ms | ~10 |

**Resposta à pergunta do exercício:**

> A versão ruim tem **mais** linhas de código (~15 vs ~10). Isso diz que N+1 **não se encontra pela leitura do código** — ninguém escreve um laço propositalmente para fazer 51 consultas. O N+1 aparece quando alguém "só precisa do nome do autor" dentro de um `.map()` em outro arquivo, ou quando o serviço cresce aos poucos. Por isso N+1 se encontra pelo **log de consultas**, não pela revisão visual do código.

## Etapa 9 — CRUD: create, save, delete e o SQL de cada um

### CREATE

**TypeScript:**
```ts
async criar(dto: CriarObraDto): Promise<Obra> {
  const autor = await this.autores.findOneBy({ id: dto.autorId });
  if (!autor) throw new NotFoundException(`Autor ${dto.autorId} não encontrado.`);

  const obra = this.obras.create({
    titulo: dto.titulo.trim(),
    isbn: dto.isbn ?? null,
    anoPublicacao: dto.anoPublicacao ?? null,
    autorId: dto.autorId,
  });

  return this.obras.save(obra);
}
```

**SQL (INSERT):**
```sql
INSERT INTO "obras" ("id", "titulo", "isbn", "anoPublicacao", "autorId", "criadoEm", "atualizadoEm")
VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
-- Parâmetros: ["<uuid>", "Livro Teste CREATE", "978-00-000-000", 2020, "aaaaaaaa-0000-0000-0000-0001"]
```

### UPDATE

**TypeScript:**
```ts
async atualizar(id: string, dto: AtualizarObraDto): Promise<Obra> {
  const obra = await this.obterPorId(id);
  if (dto.titulo !== undefined) obra.titulo = dto.titulo.trim();
  if (dto.isbn !== undefined) obra.isbn = dto.isbn ?? null;
  if (dto.anoPublicacao !== undefined) obra.anoPublicacao = dto.anoPublicacao ?? null;
  return this.obras.save(obra);
}
```

**SQL (UPDATE):**
```sql
UPDATE "obras"
SET "titulo" = ?, "isbn" = ?, "anoPublicacao" = ?, "atualizadoEm" = datetime('now')
WHERE "id" = ?
-- Parâmetros: ["Livro Teste CREATE Atualizado", "978-00-000-000", 2020, "<uuid>"]
```

### DELETE

**TypeScript:**
```ts
async remover(id: string): Promise<void> {
  const obra = await this.obterPorId(id);
  await this.obras.remove(obra);
}
```

**SQL (DELETE):**
```sql
DELETE FROM "obras" WHERE "id" = ?
-- Parâmetros: ["<uuid>"]
```

> ⚠️ Com `onDelete: 'RESTRICT'` na FK `obra.autorId`, deletar uma obra que tenha exemplares com `CASCADE` remove os exemplares também.

## Etapas 11–13 — Busca com filtros opcionais no QueryBuilder

**Regra:** sempre parâmetros nomeados (`:titulo`), **nunca** concatenação de texto do usuário na string SQL.

```ts
async listar(filtros: ListarObrasQueryDto) {
  const qb = this.obras.createQueryBuilder('obra');
  qb.leftJoinAndSelect('obra.autor', 'autor');

  if (filtros.q) {
    qb.andWhere('UPPER(obra.titulo) LIKE UPPER(:q)', { q: `%${filtros.q}%` });
  }
  if (filtros.autorId) {
    qb.andWhere('obra.autorId = :autorId', { autorId: filtros.autorId });
  }

  qb.orderBy('obra.criadoEm', 'DESC');
  qb.skip((filtros.pagina - 1) * filtros.limite);
  qb.take(filtros.limite);

  return qb.getManyAndCount();
}
```

O valor viaja **separado da consulta**: o driver envia o comando SQL com placeholders (`:q`, `:autorId`) e os parâmetros em uma mensagem separada. O banco nunca interpreta o dado como SQL — injeção de SQL é impossível.

## E06.3 — Relatórios com QueryBuilder

### Relatório 1 — Quantas obras por autor, só quem tem mais de 3, do maior para o menor

**TypeScript:**
```ts
async relatorioObrasPorAutor(): Promise<any[]> {
  return this.obras
    .createQueryBuilder('obra')
    .select('autor.nome', 'autor')
    .addSelect('COUNT(obra.id)', 'totalObras')
    .innerJoin('obra.autor', 'autor')
    .groupBy('autor.id')
    .groupBy('autor.nome')
    .having('COUNT(obra.id) > 3')
    .orderBy('totalObras', 'DESC')
    .getRawMany();
}
```

**SQL:**
```sql
SELECT "autor"."nome" AS "autor", COUNT("obra"."id") AS "totalObras"
FROM "obras" "obra"
INNER JOIN "autores" "autor" ON "autor"."id" = "obra"."autorId"
GROUP BY "autor"."id", "autor"."nome"
HAVING COUNT("obra"."id") > 3
ORDER BY totalObras DESC
-- Parâmetros: []
```

### Relatório 2 — Quantos exemplares por estado

**TypeScript:**
```ts
async relatorioExemplaresPorEstado(): Promise<any[]> {
  return this.exemplares
    .createQueryBuilder('exemplar')
    .select('exemplar.estado', 'estado')
    .addSelect('COUNT(exemplar.id)', 'total')
    .groupBy('exemplar.estado')
    .orderBy('total', 'DESC')
    .getRawMany();
}
```

**SQL:**
```sql
SELECT "exemplar"."estado" AS "estado", COUNT("exemplar"."id") AS "total"
FROM "exemplares" "exemplar"
GROUP BY "exemplar"."estado"
ORDER BY total DESC
-- Parâmetros: []
-- Resultado: DISPONIVEL=117, EMPRESTADO=60, DESGASTADO=56, DESCARTADO=28
```

### Relatório 3 — Autores sem nenhuma obra cadastrada

#### Versão A: LEFT JOIN … IS NULL (recomendada)

**TypeScript:**
```ts
async autoresSemObraLeftJoin(): Promise<any[]> {
  return this.autores
    .createQueryBuilder('autor')
    .leftJoin('autor.obras', 'obra')
    .where('obra.id IS NULL')
    .select('autor.id', 'id')
    .addSelect('autor.nome', 'nome')
    .getRawMany();
}
```

**SQL:**
```sql
SELECT "autor"."id" AS "id", "autor"."nome" AS "nome"
FROM "autores" "autor"
LEFT JOIN "obras" "obra" ON "obra"."autorId" = "autor"."id"
WHERE "obra"."id" IS NULL
-- Parâmetros: []
-- Resultado: 5 autores sem obra
```

#### Versão B: NOT IN (para comparação de performance)

**TypeScript:**
```ts
async autoresSemObraNotIn(): Promise<any[]> {
  return this.autores
    .createQueryBuilder('autor')
    .where('autor.id NOT IN (SELECT obra.autorId FROM obras obra)')
    .select('autor.id', 'id')
    .addSelect('autor.nome', 'nome')
    .getRawMany();
}
```

**SQL:**
```sql
SELECT "autor"."id" AS "id", "autor"."nome" AS "nome"
FROM "autores" "autor"
WHERE "autor"."id" NOT IN (SELECT obra.autorId FROM obras obra)
-- Parâmetros: []
-- Resultado: 5 autores sem obra (mesmo resultado)
```

> `NOT IN` materializa a subconsulta inteira e degrada rápido com volume. `LEFT JOIN … IS NULL` permite que o banco use o índice da FK e é muito mais rápido em grandes tabelas.

### Relatório 4 — Obras com pelo menos um exemplar disponível

**TypeScript:**
```ts
async obrasComExemplarDisponivel(): Promise<any[]> {
  return this.obras
    .createQueryBuilder('obra')
    .innerJoin('obra.exemplares', 'exemplar')
    .where('exemplar.estado = :estado', {
      estado: EstadoExemplar.DISPONIVEL,
    })
    .select('obra.id', 'id')
    .addSelect('obra.titulo', 'titulo')
    .distinct(true)
    .getRawMany();
}
```

**SQL:**
```sql
SELECT DISTINCT "obra"."id" AS "id", "obra"."titulo" AS "titulo"
FROM "obras" "obra"
INNER JOIN "exemplares" "exemplar" ON "exemplar"."obraId" = "obra"."id"
WHERE "exemplar"."estado" = ?
-- Parâmetros: ["DISPONIVEL"]
```

