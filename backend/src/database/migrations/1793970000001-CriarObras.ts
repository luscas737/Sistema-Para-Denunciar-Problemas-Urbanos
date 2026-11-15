import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriarObras1793970000001 implements MigrationInterface {
  name = 'CriarObras1793970000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "obras" (
        "id" varchar PRIMARY KEY NOT NULL,
        "titulo" varchar(200) NOT NULL,
        "isbn" varchar(50),
        "anoPublicacao" int,
        "autorId" varchar NOT NULL,
        "criadoEm" datetime NOT NULL DEFAULT (datetime('now')),
        "atualizadoEm" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_obras_autor" FOREIGN KEY ("autorId") REFERENCES "autores" ("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_obras_autorId" ON "obras" ("autorId")`);
    await queryRunner.query(`CREATE INDEX "IDX_obras_anoPublicacao" ON "obras" ("anoPublicacao")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_obras_anoPublicacao"');
    await queryRunner.query('DROP INDEX "IDX_obras_autorId"');
    await queryRunner.query('DROP TABLE "obras"');
  }
}