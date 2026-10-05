import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriarSetores1759500150000 implements MigrationInterface {
  name = 'CriarSetores1759500150000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "setores" (
        "id" varchar PRIMARY KEY NOT NULL,
        "nome" varchar(120) NOT NULL,
        "descricao" varchar(300),
        "email" varchar(160),
        "ativo" boolean NOT NULL DEFAULT (1),
        "criadoEm" datetime NOT NULL DEFAULT (datetime('now')),
        "atualizadoEm" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "UQ_setores_nome" UNIQUE ("nome")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "setores"');
  }
}
