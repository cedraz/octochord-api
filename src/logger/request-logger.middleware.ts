/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLogger } from './logger.service';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLogger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl, body } = req;

    req.on('error', (error) => {
      this.logger.error(`Erro na requisição: ${error.message}`, 'HTTP', {
        method,
        originalUrl,
        error: error.stack,
      });
    });

    res.on('finish', () => {
      const handleFinish = () => {
        const { statusCode } = res;
        const duration = Date.now() - start;

        this.logger.log(`${originalUrl} - ${duration}ms`, 'HTTP', {
          method,
          statusCode,
          requestBody: body ? body : null,
        });
      };

      handleFinish();
    });

    next();
  }
}
