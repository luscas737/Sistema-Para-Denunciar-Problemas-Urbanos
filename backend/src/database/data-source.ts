import { DataSource, DataSourceOptions } from 'typeorm';

export const opcoesBanco: DataSourceOptions = {
  type: 'sqlite',
  database: process.env.DB_PATH || 'dev.db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [
    __dirname + '/migrations/*{.ts,.js}',
    __dirname + '/../migracoes/*{.ts,.js}',
  ],
  synchronize: false,
  logging: process.env.LOG_QUERIES === 'true' ? ['query', 'error'] : false,
};

export default new DataSource(opcoesBanco);
