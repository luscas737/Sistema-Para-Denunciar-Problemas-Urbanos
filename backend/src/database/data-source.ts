import { DataSource, DataSourceOptions } from 'typeorm';

/**
 * Opções compartilhadas entre a aplicação (AppModule) e o CLI do TypeORM.
 * `synchronize` fica desligado: o schema é criado e evoluído por migrations.
 */
export const opcoesBanco: DataSourceOptions = {
  type: 'sqlite',
  database: process.env.DB_PATH || 'dev.db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
};

export default new DataSource(opcoesBanco);
