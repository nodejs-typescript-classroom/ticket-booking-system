import { CallHandler, ExecutionContext, HttpException, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggerInterceptor.name);
  intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> | Promise<Observable<unknown>> {
    const request: Request = context.switchToHttp().getRequest();
    const userAgent = request.get('user-agent') ?? '';
    const { ip, method, path: url } = request;
    this.logger.log({method, url, userAgent, ip, name: context.getClass().name, handler: context.getHandler().name, type: 'Invoke' });
    const now = Date.now();
    return next.handle().pipe(
      tap((res) => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const contentLength = response.get('content-length');
        this.logger.log({
          method, url, statusCode, contentLength, userAgent, 
          requestInMillis: Date.now() - now,
          type: 'Response'
        });
      }),
      catchError((error: unknown) => {
        const response: Response = context.switchToHttp().getResponse();
        const httpError = error as HttpException;
        const statusCode = httpError.getStatus() ?? response.statusCode ?? undefined;
        this.logger.error({
          method, url, statusCode, userAgent, ip, class: context.getClass().name, 
          handler: context.getHandler().name,
          requestInMillis: Date.now() - now,
          type: 'Response'
        });
        return throwError(() => error);
      })
    );
  }
}