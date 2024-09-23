import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Logger, PinoLogger } from 'nestjs-pino';
import { Request } from 'express';
let app: INestApplication;
const pinoLogger = new PinoLogger({
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
  }
});
async function bootstrap() {
  app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  // enable shutdown event listener
  app.enableShutdownHooks();
  await app.listen(3000);
}
bootstrap();
// setup graceful shutdown logic
const gracefulShutdown = (signal?: unknown) => {
  pinoLogger.info('server gracefulShutdown...', signal);
  if (app) {
    app.close().then(() =>{
      pinoLogger.info('server sucessfully shutdown', signal);
      process.exit(0);
    })
    .catch((err: unknown) => pinoLogger.error('server shutdown failed', err));
  }
  setTimeout(() => {
    pinoLogger.error('force to shutdown after 5 seconds');
    process.exit(1);
  }, 5000);
}
process.on('uncaughtException', gracefulShutdown);
process.on('unhandledRejection', gracefulShutdown);
process.on('rejectionHandled', gracefulShutdown);