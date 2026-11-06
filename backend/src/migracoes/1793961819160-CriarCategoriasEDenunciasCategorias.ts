import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriarCategoriasEDenunciasCategorias1793961819160 implements MigrationInterface {
  name = 'CriarCategoriasEDenunciasCategorias1793961819160';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Nova entidade Categoria (substitui o enum em texto de Denuncia.categoria)
    await queryRunner.query(`
      CREATE TABLE "categorias" (
        "id" varchar PRIMARY KEY NOT NULL,
        "nome" varchar(100) NOT NULL,
        "descricao" varchar(300),
        "ativo" boolean NOT NULL DEFAULT (1),
        "criadoEm" datetime NOT NULL DEFAULT (datetime('now')),
        "atualizadoEm" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "UQ_categorias_nome" UNIQUE ("nome")
      )
    `);

    // Entidade associativa N-N Denuncia <-> Categoria (com dados próprios)
    await queryRunner.query(`
      CREATE TABLE "denuncias_categorias" (
        "id" varchar PRIMARY KEY NOT NULL,
        "denunciaId" varchar NOT NULL,
        "categoriaId" varchar NOT NULL,
        "dataVinculacao" datetime NOT NULL DEFAULT (datetime('now')),
        "ehPrincipal" boolean NOT NULL DEFAULT (0),
        CONSTRAINT "UQ_denuncia_categoria" UNIQUE ("denunciaId", "categoriaId"),
        CONSTRAINT "FK_denuncias_categorias_denuncia"
          FOREIGN KEY ("denunciaId") REFERENCES "denuncias" ("id")
          ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_denuncias_categorias_categoria"
          FOREIGN KEY ("categoriaId") REFERENCES "categorias" ("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);

    // Índices compostos para listagens frequentes (mapa e fila de atendimento)
    await queryRunner.query(
      'CREATE INDEX "IDX_denuncias_categoria_status" ON "denuncias" ("categoria", "status")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_denuncias_setorAtualId_status" ON "denuncias" ("setorAtualId", "status")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_denuncias_setorAtualId_status"');
    await queryRunner.query('DROP INDEX "IDX_denuncias_categoria_status"');
    await queryRunner.query('DROP TABLE "denuncias_categorias"');
    await queryRunner.query('DROP TABLE "categorias"');
  }
}
