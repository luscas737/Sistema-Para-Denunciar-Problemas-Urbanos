import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriarEncaminhamentos1759500300000 implements MigrationInterface {
  name = 'CriarEncaminhamentos1759500300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "encaminhamentos" (
        "id" varchar PRIMARY KEY NOT NULL,
        "denunciaId" varchar NOT NULL,
        "setorDestinoId" varchar NOT NULL,
        "enviadoPorId" varchar NOT NULL,
        "observacao" varchar(500),
        "dataEncaminhamento" datetime NOT NULL DEFAULT (datetime('now')),
        "aceite" datetime,
        CONSTRAINT "UQ_encaminhamento_denuncia_setor" UNIQUE ("denunciaId", "setorDestinoId"),
        CONSTRAINT "FK_encaminhamentos_denuncia"
          FOREIGN KEY ("denunciaId") REFERENCES "denuncias" ("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_encaminhamentos_setorDestino"
          FOREIGN KEY ("setorDestinoId") REFERENCES "setores" ("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "FK_encaminhamentos_enviadoPor"
          FOREIGN KEY ("enviadoPorId") REFERENCES "usuarios" ("id")
          ON DELETE RESTRICT ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_encaminhamentos_denunciaId" ON "encaminhamentos" ("denunciaId")');
    await queryRunner.query('CREATE INDEX "IDX_encaminhamentos_setorDestinoId" ON "encaminhamentos" ("setorDestinoId")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "encaminhamentos"');
  }
}
