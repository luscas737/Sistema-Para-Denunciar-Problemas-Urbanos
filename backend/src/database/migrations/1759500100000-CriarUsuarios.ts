import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Herança de tabela única (decisão D1): uma tabela `usuarios` com a coluna
 * discriminadora `tipo`. Colunas de subtipo ficam nulas nos outros tipos.
 */
export class CriarUsuarios1759500100000 implements MigrationInterface {
  name = 'CriarUsuarios1759500100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "usuarios" (
        "id" varchar PRIMARY KEY NOT NULL,
        "nome" varchar(120) NOT NULL,
        "email" varchar(160) NOT NULL,
        "telefone" varchar(20),
        "ativo" boolean NOT NULL DEFAULT (1),
        "cpf" varchar(14),
        "bairro" varchar(80),
        "criadoEm" datetime NOT NULL DEFAULT (datetime('now')),
        "atualizadoEm" datetime NOT NULL DEFAULT (datetime('now')),
        "tipo" varchar NOT NULL,
        CONSTRAINT "CHK_usuarios_tipo" CHECK ("tipo" IN ('cidadao','atendente','administrador')),
        CONSTRAINT "CHK_usuarios_cpf_somente_cidadao" CHECK ("tipo" = 'cidadao' OR "cpf" IS NULL)
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_usuarios_tipo" ON "usuarios" ("tipo")');
    await queryRunner.query('CREATE UNIQUE INDEX "UQ_usuarios_email" ON "usuarios" ("email")');
    await queryRunner.query('CREATE UNIQUE INDEX "UQ_usuarios_cpf" ON "usuarios" ("cpf")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "usuarios"');
  }
}
