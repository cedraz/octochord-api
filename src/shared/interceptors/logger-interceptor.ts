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
import { PrometheusService } from 'src/providers/prom-client/prometheus.service';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(
    private readonly logger: CustomLogger,
    private readonly prometheusService: PrometheusService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl, body: requestBody } = req;

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse<Response>();
        const { statusCode } = res;
        const duration = Date.now() - now;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const routeTemplate = req.route?.path;

        this.prometheusService.observeHttp({
          method,
          endpoint: routeTemplate,
          statusCode: statusCode,
          duration,
        });

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
    const maskedData: Record<string, any> = this.maskSensitiveData(logObject);
    this.logger.log(
      `${method} ${endpoint} - ${duration}ms`,
      'HTTP',
      maskedData,
    );

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

  private maskSensitiveData(data: Record<string, any>): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (data.requestBody) {
      const requestBody = data.requestBody as Record<string, any>;
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
