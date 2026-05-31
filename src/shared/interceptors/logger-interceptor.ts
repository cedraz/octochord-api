/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggerService } from '../application/logger.service';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept<T>(context: ExecutionContext, next: CallHandler<T>): Observable<T> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl, body: requestBody } = req;

    return next.handle().pipe(
      tap((responseBody) => {
        const res = context.switchToHttp().getResponse<Response>();
        const { statusCode } = res;
        const duration = Date.now() - now;

        this.logSuccess(
          method,
          originalUrl,
          statusCode,
          duration,
          requestBody as Record<string, unknown>,
          responseBody,
        );
      }),
      catchError((error: Error) => {
        return throwError(() => error);
      }),
    );
  }

  private logSuccess(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    requestBody: Record<string, unknown>,
    responseBody: unknown,
  ) {
    const logObject = {
      method,
      endpoint,
      duration,
      statusCode,
      requestBody,
      responseBody,
    };
    const maskedData: Record<string, unknown> =
      this.maskSensitiveData(logObject);

    this.logger.log(
      `${method} ${endpoint} - ${duration}ms`,
      'HTTP',
      maskedData,
    );
  }

  private maskSensitiveData(
    data: Record<string, unknown>,
  ): Record<string, unknown> {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (data.requestBody) {
      const requestBody = data.requestBody as Record<string, unknown>;
      if (requestBody.password) {
        requestBody.password = '***';
      }

      if (requestBody.confirmPassword) {
        requestBody.confirmPassword = '***';
      }

      if (requestBody.newPassword) {
        requestBody.newPassword = '***';
      }
    }

    return data;
  }
}
