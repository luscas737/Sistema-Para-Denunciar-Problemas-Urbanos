import { MigrationInterface, QueryRunner } from 'typeorm';

const COLUNAS_COMUNS =
  '"id", "titulo", "descricao", "categoria", "latitude", "longitude", "status", "criadoEm", "atualizadoEm"';

export class EvoluirDenuncias1759500200000 implements MigrationInterface {
  name = 'EvoluirDenuncias1759500200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "denuncias_nova" (
        "id" varchar PRIMARY KEY NOT NULL,
        "titulo" varchar(100) NOT NULL,
        "descricao" varchar(1000) NOT NULL,
        "categoria" varchar(20) NOT NULL CHECK ("categoria" IN ('buraco','poste','lixo','agua','outros')),
        "latitude" real NOT NULL CHECK ("latitude" BETWEEN -90 AND 90),
        "longitude" real NOT NULL CHECK ("longitude" BETWEEN -180 AND 180),
        "status" varchar(20) NOT NULL DEFAULT ('recebida') CHECK ("status" IN ('recebida','encaminhada','em_andamento','resolvida')),
        "cidadaoId" varchar,
        "setorAtualId" varchar,
        "arquivada" boolean NOT NULL DEFAULT (0),
        "arquivadaEm" datetime,
        "criadoEm" datetime NOT NULL DEFAULT (datetime('now')),
        "atualizadoEm" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_denuncias_cidadao" FOREIGN KEY ("cidadaoId") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_denuncias_setorAtual" FOREIGN KEY ("setorAtualId") REFERENCES "setores" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`
      INSERT INTO "denuncias_nova" (${COLUNAS_COMUNS})
      SELECT ${COLUNAS_COMUNS} FROM "denuncias"
    `);
    await queryRunner.query('DROP TABLE "denuncias"');
    await queryRunner.query('ALTER TABLE "denuncias_nova" RENAME TO "denuncias"');
    await queryRunner.query('CREATE INDEX "IDX_denuncias_cidadaoId" ON "denuncias" ("cidadaoId")');
    await queryRunner.query('CREATE INDEX "IDX_denuncias_setorAtualId" ON "denuncias" ("setorAtualId")');
    await queryRunner.query('CREATE INDEX "IDX_denuncias_status" ON "denuncias" ("status")');
    await queryRunner.query('CREATE INDEX "IDX_denuncias_arquivada" ON "denuncias" ("arquivada")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "denuncias_antiga" (
        "id" varchar PRIMARY KEY NOT NULL,
        "titulo" varchar(100) NOT NULL,
        "descricao" varchar(1000) NOT NULL,
        "categoria" varchar(20) NOT NULL,
        "latitude" real NOT NULL,
        "longitude" real NOT NULL,
        "foto" varchar(500),
        "status" varchar(20) NOT NULL DEFAULT ('recebida'),
        "criadoEm" datetime NOT NULL DEFAULT (datetime('now')),
        "atualizadoEm" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);
    await queryRunner.query(`
      INSERT INTO "denuncias_antiga" (${COLUNAS_COMUNS})
      SELECT ${COLUNAS_COMUNS} FROM "denuncias"
    `);
    await queryRunner.query('DROP TABLE "denuncias"');
    await queryRunner.query('ALTER TABLE "denuncias_antiga" RENAME TO "denuncias"');
  }
}
