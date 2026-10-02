import { DataSource, DataSourceOptions } from 'typeorm';

export const opcoesBanco: DataSourceOptions = {
  type: 'sqlite',
  database: process.env.DB_PATH || 'dev.db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
};

export default new DataSource(opcoesBanco);
