import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { getDataSource } from '../data_source/test_container.source';
export const initPostgresql = async() => {
  const postgresql = await new PostgreSqlContainer('postgres:14')
    .withExposedPorts(5432, 5432)
    .withUsername('admin')
    .withPassword('password')
    .withDatabase('ticket_system_db')
    .start();
  global.postgresql = postgresql;
  const DB_URI = global.postgresql.getConnectionUri();
  process.env.DB_URI = DB_URI;
  const datasource = await getDataSource(DB_URI);
  await datasource.runMigrations();
}
const init =  async () => {
  await initPostgresql();
}
export default init;