import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriarExemplares1793970000002 implements MigrationInterface {
  name = 'CriarExemplares1793970000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "exemplares" (
        "id" varchar PRIMARY KEY NOT NULL,
        "tombo" varchar(50) NOT NULL,
        "estado" varchar(20) NOT NULL,
        "obraId" varchar NOT NULL,
        "criadoEm" datetime NOT NULL DEFAULT (datetime('now')),
        "atualizadoEm" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_exemplares_obra" FOREIGN KEY ("obraId") REFERENCES "obras" ("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_exemplares_obraId" ON "exemplares" ("obraId")`);
    await queryRunner.query(`CREATE INDEX "IDX_exemplares_estado" ON "exemplares" ("estado")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_exemplares_estado"');
    await queryRunner.query('DROP INDEX "IDX_exemplares_obraId"');
    await queryRunner.query('DROP TABLE "exemplares"');
  }
}