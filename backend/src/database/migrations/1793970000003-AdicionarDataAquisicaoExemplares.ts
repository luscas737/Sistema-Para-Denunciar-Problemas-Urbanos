import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdicionarDataAquisicaoExemplares1793970000003 implements MigrationInterface {
  name = 'AdicionarDataAquisicaoExemplares1793970000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "exemplares" ADD "dataAquisicao" datetime`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "exemplares" DROP COLUMN "dataAquisicao"`);
  }
}