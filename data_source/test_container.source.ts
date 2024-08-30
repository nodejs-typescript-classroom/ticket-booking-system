import { DataSource } from 'typeorm';

export const getDataSource = async (dburi: string) => {
  const datasource =  new DataSource({
    type: 'postgres',
    url: dburi,
    ssl: false,
    extra: {
      ssl: null,
    },
    migrations: ['migrations/*.ts'],
    migrationsRun: true,
    entities: ['src/**/*.entity.ts'],
  });
  await datasource.initialize();
  return datasource;
}