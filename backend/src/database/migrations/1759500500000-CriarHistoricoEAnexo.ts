import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Entidades da P3 (seções 5.2/5.3/5.4 do planejamento):
 * - `historico_status`: CHECK de mudança real de status; denúncia RESTRICT; autor SET NULL.
 * - `anexos`: único CASCADE do modelo (anexo não tem valor fora da denúncia).
 * - `usuarios.nivelAcesso`: subtipo Administrador (só existe quando tipo='administrador').
 */
export class CriarHistoricoEAnexo1759500500000 implements MigrationInterface {
  name = 'CriarHistoricoEAnexo1759500500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "usuarios" ADD COLUMN "nivelAcesso" integer
      CHECK ("nivelAcesso" IS NULL OR ("tipo" = 'administrador' AND "nivelAcesso" IN (1, 2)))
    `);

    await queryRunner.query(`
      CREATE TABLE "historico_status" (
        "id" varchar PRIMARY KEY NOT NULL,
        "denunciaId" varchar NOT NULL,
        "statusAnterior" varchar(20),
        "statusAtual" varchar(20) NOT NULL,
        "alteradoPorId" varchar,
        "comentario" varchar(300),
        "dataAlteracao" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "CHK_historico_status_mudanca_real" CHECK ("statusAnterior" IS NULL OR "statusAnterior" <> "statusAtual"),
        CONSTRAINT "CHK_historico_status_atual" CHECK ("statusAtual" IN ('recebida','encaminhada','em_andamento','resolvida')),
        CONSTRAINT "CHK_historico_status_anterior" CHECK ("statusAnterior" IS NULL OR "statusAnterior" IN ('recebida','encaminhada','em_andamento','resolvida')),
        CONSTRAINT "FK_historico_status_denuncia" FOREIGN KEY ("denunciaId") REFERENCES "denuncias" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_historico_status_alteradoPor" FOREIGN KEY ("alteradoPorId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_historico_status_denunciaId" ON "historico_status" ("denunciaId")',
    );

    await queryRunner.query(`
      CREATE TABLE "anexos" (
        "id" varchar PRIMARY KEY NOT NULL,
        "denunciaId" varchar NOT NULL,
        "url" varchar(500) NOT NULL,
        "tipo" varchar(20) NOT NULL CHECK ("tipo" IN ('imagem','documento')),
        "descricao" varchar(200),
        "enviadoPorId" varchar,
        "criadoEm" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_anexos_denuncia" FOREIGN KEY ("denunciaId") REFERENCES "denuncias" ("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_anexos_enviadoPor" FOREIGN KEY ("enviadoPorId") REFERENCES "usuarios" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_anexos_denunciaId" ON "anexos" ("denunciaId")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_anexos_denunciaId"');
    await queryRunner.query('DROP TABLE "anexos"');
    await queryRunner.query('DROP INDEX "IDX_historico_status_denunciaId"');
    await queryRunner.query('DROP TABLE "historico_status"');
    await queryRunner.query('ALTER TABLE "usuarios" DROP COLUMN "nivelAcesso"');
  }
}