import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import axios from 'axios';
import { Request, Response } from 'express';
import { env } from '../config/env.schema';
import { LoggerService } from '../application/logger.service';

interface ErrorLogPayload {
  method: string;
  path: string;
  statusCode: number;
  requestBody: Record<string, unknown>;
  responseBody: unknown;
  stack?: string;
}

@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {}

  catch(exception: HttpException | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responseBody = exception.getResponse();

      const logPayload: ErrorLogPayload = {
        method: request.method,
        path: request.url,
        statusCode: status,
        requestBody: request.body as Record<string, unknown>,
        responseBody,
      };

      this.logger.error(exception.message, 'HTTP', logPayload);

      void this.sendErrorToDiscord(exception.message, logPayload);

      return response.status(status).json(responseBody);
    }

    const responseBody = {
      statusCode: 500,
      message: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    const logPayload: ErrorLogPayload = {
      method: request.method,
      path: request.url,
      statusCode: 500,
      requestBody: request.body as Record<string, unknown>,
      responseBody,
      stack: exception.stack,
    };

    this.logger.error(exception.message, 'HTTP', logPayload);

    void this.sendErrorToDiscord(exception.message, logPayload);

    response.status(500).json(responseBody);
  }

  private async sendErrorToDiscord(message: string, payload: ErrorLogPayload) {
    if (!env.DISCORD_ERROR_WEBHOOK_URL) {
      return;
    }

    try {
      const requestBodyJson = JSON.stringify(
        payload.requestBody ?? null,
        null,
        2,
      );
      const responseBodyJson = JSON.stringify(
        payload.responseBody ?? null,
        null,
        2,
      );

      const content = [
        '🚨 **Erro na API**',
        `**${payload.method} ${payload.path}** - Status \`${payload.statusCode}\``,
        `**Mensagem:** ${message}`,
        'Request Body:',
        '```json',
        requestBodyJson.slice(0, 1900),
        '```',
        'Response Body:',
        '```json',
        responseBodyJson.slice(0, 1900),
        '```',
      ].join('\n');

      await axios.post(env.DISCORD_ERROR_WEBHOOK_URL, { content });
    } catch (error) {
      this.logger.error('Failed to send Discord error message', 'HTTP', {
        originalMessage: message,
        sendError: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
