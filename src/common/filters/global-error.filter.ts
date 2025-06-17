import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomLogger } from 'src/logger/logger.service';

@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  constructor(private logger: CustomLogger) {}

  catch(exception: HttpException | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const exceptionError = exceptionResponse;

      this.logger.error(exception.message, 'HTTP', {
        method: request.method,
        path: request.url,
        error: exceptionError,
        statusCode: status,
      });

      return response.status(status).json(exceptionResponse);
    }

    this.logger.error(exception.message, 'HTTP', {
      method: request.method,
      path: request.url,
      error: exception.stack,
      statusCode: 500,
    });

    response.status(500).json({
      statusCode: 500,
      message: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
