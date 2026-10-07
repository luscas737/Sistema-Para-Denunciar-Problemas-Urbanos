import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adiciona as colunas do subtipo Atendente (seção 5.2 do planejamento) à
 * tabela única `usuarios`, sem recriá-la: `denuncias` e `encaminhamentos`
 * já têm FK para `usuarios` e as migrations rodam com `PRAGMA foreign_keys = ON`.
 *
 * - `matricula` UNIQUE (constraint 9 da seção 5.4), só quando `tipo = 'atendente'`.
 * - `setorId` FK `SET NULL` para `setores` (lotação do servidor, seção 5.3).
 */
export class EvoluirUsuarios1759500400000 implements MigrationInterface {
  name = 'EvoluirUsuarios1759500400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "usuarios" ADD COLUMN "matricula" varchar(20)
      CHECK ("matricula" IS NULL OR "tipo" = 'atendente')
    `);
    await queryRunner.query(`
      ALTER TABLE "usuarios" ADD COLUMN "setorId" varchar
      CHECK ("setorId" IS NULL OR "tipo" = 'atendente')
      REFERENCES "setores" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(
      'CREATE UNIQUE INDEX "UQ_usuarios_matricula" ON "usuarios" ("matricula")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_usuarios_setorId" ON "usuarios" ("setorId")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_usuarios_setorId"');
    await queryRunner.query('DROP INDEX "UQ_usuarios_matricula"');
    await queryRunner.query('ALTER TABLE "usuarios" DROP COLUMN "setorId"');
    await queryRunner.query('ALTER TABLE "usuarios" DROP COLUMN "matricula"');
  }
}