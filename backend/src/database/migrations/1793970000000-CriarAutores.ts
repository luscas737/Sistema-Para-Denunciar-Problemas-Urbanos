import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriarAutores1793970000000 implements MigrationInterface {
  name = 'CriarAutores1793970000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "autores" (
        "id" varchar PRIMARY KEY NOT NULL,
        "nome" varchar(120) NOT NULL,
        "nacionalidade" varchar(100),
        "nascimento" date,
        "falecimento" date,
        "criadoEm" datetime NOT NULL DEFAULT (datetime('now')),
        "atualizadoEm" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "autores"');
  }
}