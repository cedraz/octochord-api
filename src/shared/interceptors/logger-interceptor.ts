/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { CustomLogger } from '../application/logger.service';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl, body: requestBody } = req;

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse<Response>();
        const { statusCode } = res;
        const duration = Date.now() - now;

        this.logSuccess(method, originalUrl, statusCode, duration, requestBody);
      }),
      catchError((error: Error) => {
        const duration = Date.now() - now;
        let statusCode = 500;
        let errorResponseBody: any;

        if (error instanceof HttpException) {
          statusCode = error.getStatus();
          const exceptionResponse = error.getResponse();

          if (typeof exceptionResponse === 'string') {
            errorResponseBody = {
              statusCode,
              message: exceptionResponse,
              error: error.name,
            };
          } else {
            errorResponseBody = exceptionResponse;
          }
        } else {
          errorResponseBody = {
            statusCode,
            message: 'Internal Server Error',
          };
        }

        this.logError(
          method,
          originalUrl,
          statusCode,
          duration,
          requestBody,
          errorResponseBody,
          error,
        );

        return throwError(() => error);
      }),
    );
  }

  private logSuccess(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    requestBody: any,
  ) {
    const logObject = {
      method,
      endpoint,
      duration,
      statusCode,
      requestBody,
    };
    this.logger.log(`${method} ${endpoint} - ${duration}ms`, 'HTTP', logObject);

    // if (statusCode === 201) {
    //   this.discordService
    //     .sendMessage(logObject)
    //     .catch((e) =>
    //       this.logger.error(
    //         'Failed to send Discord message from Interceptor',
    //         e,
    //       ),
    //     );
    // }
  }

  private logError(
    method: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    requestBody: any,
    responseBody: any,
    error: Error,
  ) {
    const logObject = {
      method,
      endpoint,
      duration,
      statusCode,
      requestBody,
      responseBody: responseBody || error.stack,
      errorDetails: statusCode === 500 ? error.stack : 'Not applicable',
    };

    this.logger.error(
      `Erro na requisição: ${error.message} - ${duration}ms`,
      'HTTP',
      logObject,
    );

    // this.discordService
    //   .sendMessage(logObject)
    //   .catch((e) =>
    //     this.logger.error('Failed to send Discord message from Interceptor', e),
    //   );
  }
}
