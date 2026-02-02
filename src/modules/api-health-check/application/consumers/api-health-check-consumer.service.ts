import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { api } from 'src/providers/axios';
import axios, { AxiosResponse } from 'axios';
import { NotFoundException } from '@nestjs/common';
import { ErrorMessagesHelper } from 'src/shared/helpers/error-messages.helper';
import { MailerProvider } from 'src/providers/mailer/mailer.provider';
import { SendEmailQueueService } from 'src/providers/mailer/queue/send-email-queue.service';
import { ApiHealthCheckDto } from '../dto/api-health-check.dto';
import { QueueNames } from 'src/shared/helpers/queue-names.helper';
import { HttpMethods } from 'src/shared/domain/enums/http-methods.enum';
import { CustomLogger } from 'src/shared/application/logger.service';
import { ApiHealthCheckEntity } from '../../domain/entities/api-health-check.entity';
import { APIStatus } from 'src/shared/domain/enums/api-status.enum';

@Processor(QueueNames.API_HEALTH_CHECK_QUEUE)
export class ApiHealthCheckConsumerService extends WorkerHost {
  constructor(
    private prismaService: PrismaService,
    private mailerService: MailerProvider,
    private sendEmailQueueService: SendEmailQueueService,
    private readonly logger: CustomLogger,
  ) {
    super();
  }

  private async apiHealthCheckHandler(
    email: string,
    apiHealthCheck: ApiHealthCheckEntity,
    promise: Promise<AxiosResponse<any, any>>,
  ): Promise<void> {
    const emailNotification =
      await this.prismaService.emailNotification.findUnique({
        where: { apiHealthCheckId: apiHealthCheck.id },
      });

    let newStatus: 'UP' | 'DOWN' = 'DOWN';
    let responseTime = 0;

    const FAILURE_THRESHOLD = 3;

    const start = Date.now();

    try {
      const response = await promise;

      responseTime = response.headers['request-duration']
        ? parseInt(response.headers['request-duration'] as string, 10)
        : Date.now() - start;

      newStatus =
        response.status >= 200 && response.status < 304 ? 'UP' : 'DOWN';
    } catch (error) {
      responseTime = Date.now() - start;

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          this.logger.log(
            `Request timed out for API Health Check ID: ${apiHealthCheck.id}`,
          );
          newStatus = 'DOWN';
        } else if (error.response) {
          newStatus = error.response.status < 500 ? 'UP' : 'DOWN';
        } else {
          newStatus = 'DOWN';
        }
      } else {
        newStatus = 'DOWN';
      }
    }

    let failures = apiHealthCheck.consecutiveFailures;

    if (newStatus === 'UP') {
      failures = 0;

      if (apiHealthCheck.status === APIStatus.DOWN) {
        await this.mailerService.sendEmail({
          to: email,
          subject: 'API voltou a funcionar',
          message: `A API em ${apiHealthCheck.url} voltou a funcionar.`,
        });
      }

      if (emailNotification?.emails?.length) {
        await Promise.all(
          emailNotification.emails.map((e) =>
            this.sendEmailQueueService.execute({
              to: e,
              subject: '✅ API voltou a funcionar',
              message: `A API em ${apiHealthCheck.url} voltou a responder.`,
            }),
          ),
        );
      }
    } else {
      failures += 1;
    }

    const shouldAlert =
      newStatus === APIStatus.DOWN && failures === FAILURE_THRESHOLD;

    if (shouldAlert) {
      await this.sendEmailQueueService.execute({
        to: email,
        subject: 'Alerta: API está fora do ar',
        message: `A API em ${apiHealthCheck.url} está fora do ar.`,
      });

      if (emailNotification) {
        await Promise.all(
          emailNotification.emails.map((extraEmail) =>
            this.sendEmailQueueService.execute({
              to: extraEmail,
              subject: '🚨 Alerta: API está fora do ar',
              message: `A API em ${apiHealthCheck.url} falhou ${failures} vezes consecutivas.`,
            }),
          ),
        );
      }
    }

    await Promise.all([
      this.prismaService.apiHealthCheck.update({
        where: { id: apiHealthCheck.id },
        data: {
          status: newStatus,
          lastCheckedAt: new Date(),
          consecutiveFailures: failures,
        },
      }),
      this.prismaService.apiHealthCheckLog.create({
        data: {
          status: newStatus,
          checkedAt: new Date(),
          responseTime,
          apiHealthCheck: { connect: { id: apiHealthCheck.id } },
        },
      }),
    ]);
  }

  async process({ data }: Job<ApiHealthCheckDto>) {
    const apiHealthCheck = (await this.prismaService.apiHealthCheck.findUnique({
      where: { id: data.id },
      include: { user: { select: { email: true } } },
    })) as ApiHealthCheckEntity & { user: { email: string } };

    if (!apiHealthCheck) {
      throw new NotFoundException(
        ErrorMessagesHelper.API_HEALTH_CHECK_NOT_FOUND,
      );
    }

    const { email } = apiHealthCheck.user;

    const REQUEST_TIMEOUT_MS = 10000;
    const axiosConfig = { timeout: REQUEST_TIMEOUT_MS };

    switch (data.method) {
      case HttpMethods.GET: {
        const response = api.get(data.url, axiosConfig);
        await this.apiHealthCheckHandler(email, apiHealthCheck, response);
        break;
      }
      case HttpMethods.POST: {
        const response = api.post(data.url, null, axiosConfig);
        await this.apiHealthCheckHandler(email, apiHealthCheck, response);
        break;
      }
      case HttpMethods.PUT: {
        const response = api.put(data.url, null, axiosConfig);
        await this.apiHealthCheckHandler(email, apiHealthCheck, response);
        break;
      }
      case HttpMethods.DELETE: {
        const response = api.delete(data.url, axiosConfig);
        await this.apiHealthCheckHandler(email, apiHealthCheck, response);
        break;
      }
      case HttpMethods.PATCH: {
        const response = api.patch(data.url, null, axiosConfig);
        await this.apiHealthCheckHandler(email, apiHealthCheck, response);
        break;
      }
      case HttpMethods.HEAD: {
        const response = api.head(data.url, axiosConfig);
        await this.apiHealthCheckHandler(email, apiHealthCheck, response);
        break;
      }
    }
  }
}
