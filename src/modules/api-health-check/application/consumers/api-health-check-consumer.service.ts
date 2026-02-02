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

@Processor(QueueNames.API_HEALTH_CHECK_QUEUE)
export class ApiHealthCheckConsumerService extends WorkerHost {
  constructor(
    private prismaService: PrismaService,
    private mailerService: MailerProvider,
    private sendEmailQueueService: SendEmailQueueService,
  ) {
    super();
  }

  private async apiHealthCheckHandler(
    id: string,
    email: string,
    promise: Promise<AxiosResponse<any, any>>,
  ): Promise<void> {
    const emailNotification =
      await this.prismaService.emailNotification.findUnique({
        where: { apiHealthCheckId: id },
      });

    let newStatus: 'UP' | 'DOWN' = 'DOWN';
    let responseTime = 0;

    try {
      const response = await promise;

      responseTime = response.headers['request-duration']
        ? parseInt(response.headers['request-duration'] as string, 10)
        : 0;

      newStatus =
        response.status >= 200 && response.status < 304 ? 'UP' : 'DOWN';
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          newStatus = error.response.status < 500 ? 'UP' : 'DOWN';
        } else {
          newStatus = 'DOWN';
        }
      } else {
        newStatus = 'DOWN';
      }
    }

    if (newStatus === 'DOWN') {
      await this.mailerService.sendEmail({
        to: email,
        subject: 'API Health Check Alert',
        message: `The API with ID ${id} is currently DOWN. Please check the service.`,
      });

      if (emailNotification) {
        emailNotification.emails.forEach((email) => {
          this.sendEmailQueueService.execute({
            to: email,
            subject: 'API Health Check Alert',
            message: `The API with ID ${id} is currently DOWN. Please check the service.`,
          });
        });
      }
    }

    await this.prismaService.apiHealthCheck.update({
      where: { id },
      data: { status: newStatus, lastCheckedAt: new Date() },
    });

    await this.prismaService.apiHealthCheckLog.create({
      data: {
        status: newStatus,
        checkedAt: new Date(),
        responseTime,
        apiHealthCheck: { connect: { id } },
      },
    });
  }

  async process({ data }: Job<ApiHealthCheckDto>) {
    const apiHealthCheck = await this.prismaService.apiHealthCheck.findUnique({
      where: { id: data.id },
      include: { user: { select: { email: true } } },
    });

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
        await this.apiHealthCheckHandler(data.id, email, response);
        break;
      }
      case HttpMethods.POST: {
        const response = api.post(data.url, {}, axiosConfig);
        await this.apiHealthCheckHandler(data.id, email, response);
        break;
      }
      case HttpMethods.PUT: {
        const response = api.put(data.url, {}, axiosConfig);
        await this.apiHealthCheckHandler(data.id, email, response);
        break;
      }
      case HttpMethods.DELETE: {
        const response = api.delete(data.url, axiosConfig);
        await this.apiHealthCheckHandler(data.id, email, response);
        break;
      }
      case HttpMethods.PATCH: {
        const response = api.patch(data.url, {}, axiosConfig);
        await this.apiHealthCheckHandler(data.id, email, response);
        break;
      }
      case HttpMethods.HEAD: {
        const response = api.head(data.url, axiosConfig);
        await this.apiHealthCheckHandler(data.id, email, response);
        break;
      }
    }
  }
}
