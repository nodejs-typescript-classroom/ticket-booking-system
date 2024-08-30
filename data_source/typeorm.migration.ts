import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();
const configService = new ConfigService();
const IS_DB_SSL_MODE = configService.getOrThrow<string>(
  'NODE_ENV',
  'dev'
) == 'production';
export default new DataSource({
  type: 'postgres',
  url: configService.getOrThrow<string>('DB_URI', ''),
  ssl: IS_DB_SSL_MODE,
  extra: {
    ssl: IS_DB_SSL_MODE ? { rejectUnauthorized: false } : null,
  },
  migrations: ['migrations/*.ts'],
  migrationsRun: true,
  entities: ['src/**/*.entity.ts'],
});

