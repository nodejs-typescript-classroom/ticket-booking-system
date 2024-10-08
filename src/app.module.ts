import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateSchema } from './validate.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './events/events.module';
import { TicketsModule } from './tickets/tickets.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Logger, LoggerModule } from 'nestjs-pino';
import { Request } from 'express';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerInterceptor } from './logger.interceptor';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      useFactory: async () => {
        return {
          pinoHttp: {
            autoLogging: false,
            base: null,
            quietReqLogger: true,
            genReqId: (request: Request) => request.headers['x-correlation-id'] || crypto.randomUUID(),
            level: 'info',
            formatters: {
              level (label)  {
                return {level: label }
              }
            },
          },
        }
      }
    }),
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: validateSchema,
    }),
    TypeOrmModule.forRootAsync({
      useFactory(configService: ConfigService, logger: Logger) {
        const IS_DB_SSL_MODE = configService.get<string>('NODE_ENV', 'dev') == 'production';
        const MAX_RETRY_TIME = 5;
        let count = 0;
        return {
          ssl: IS_DB_SSL_MODE,
          extra: {
            ssl: IS_DB_SSL_MODE ? { rejectUnauthorized: false } : null,
            poolSize: 5,
            idleTimeoutMillis: 3600000,
          },
          type: 'postgres',
          url: configService.getOrThrow<string>('DB_URI', ''),
          synchronize: false,
          autoLoadEntities: true,
          toRetry(err) {
            logger.error({message: 'typeorm retry failed', retry_count: count+1}, err, 'Typeorm');
            count++;
            return count < MAX_RETRY_TIME;
          },
        }
      },
      inject:[ConfigService, Logger]
    }),
    UsersModule, AuthModule, EventsModule, TicketsModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_INTERCEPTOR,
    useClass: LoggerInterceptor,
  }],
})
export class AppModule {}
