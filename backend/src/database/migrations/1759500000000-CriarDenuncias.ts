import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Baseline: cria a tabela `denuncias` no estado atual do projeto.
 * As evoluções (cidadaoId, setorAtualId, arquivamento) entram em migrations seguintes.
 */
export class CriarDenuncias1759500000000 implements MigrationInterface {
  name = 'CriarDenuncias1759500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "denuncias" (
        "id" varchar PRIMARY KEY NOT NULL,
        "titulo" varchar(100) NOT NULL,
        "descricao" varchar(1000) NOT NULL,
        "categoria" varchar(20) NOT NULL CHECK ("categoria" IN ('buraco','poste','lixo','agua','outros')),
        "latitude" real NOT NULL CHECK ("latitude" BETWEEN -90 AND 90),
        "longitude" real NOT NULL CHECK ("longitude" BETWEEN -180 AND 180),
        "foto" varchar(500),
        "status" varchar(20) NOT NULL DEFAULT ('recebida') CHECK ("status" IN ('recebida','encaminhada','em_andamento','resolvida')),
        "criadoEm" datetime NOT NULL DEFAULT (datetime('now')),
        "atualizadoEm" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "denuncias"');
  }
}
