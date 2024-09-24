import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';
import { getDataSource } from '../data_source/test_container.source';
export const initPostgresql = async () => {
  const postgresql = await new PostgreSqlContainer('postgres:14')
    .withExposedPorts(5432, 5432)
    .withName('test-pg')
    .withUsername('admin')
    .withPassword('password')
    .withDatabase('ticket_system_db')
    .start();
  global.postgresql = postgresql;
  const DB_URI = global.postgresql.getConnectionUri();
  process.env.DB_URI = DB_URI;
  process.env.ADMIN_USER = 'admin@hotmail.com';
  process.env.ADMIN_PASSWORD = '1@q#Abz%';
  const datasource = await getDataSource(DB_URI);
  await datasource.runMigrations();
}
const initRedis = async () => {
  const redis = await new RedisContainer()
    .withPassword('123456')
    .withPrivilegedMode()
    .withName('test-redis')
    .start();
  const REDIS_URL = redis.getConnectionUrl();
  process.env.REDIS_URL = REDIS_URL;
  global.redis = redis;
}
const init = async () => {
  await initPostgresql();
  await initRedis();
}
export default init;