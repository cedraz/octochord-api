import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QueueNames } from '../utils/queue-names.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiHealthCheckDto } from '../dto/api-health-check.dto';
import { api } from 'src/providers/axios';
import axios, { AxiosResponse } from 'axios';
import { MailerService } from 'src/providers/mailer/mailer.service';
import { NotFoundException } from '@nestjs/common';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { SendEmailQueueService } from '../queues/send-email-queue.service';

@Processor(QueueNames.API_HEALTH_CHECK_QUEUE)
export class ApiHealthCheckConsumerService extends WorkerHost {
  constructor(
    private prismaService: PrismaService,
    private mailerService: MailerService,
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

    try {
      const response = await promise;

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

    switch (data.method) {
      case 'GET': {
        const response = api.get(data.url);
        await this.apiHealthCheckHandler(data.id, email, response);
        break;
      }
      case 'POST': {
        const response = api.post(data.url);
        await this.apiHealthCheckHandler(data.id, email, response);
        break;
      }
      case 'PUT': {
        const response = api.put(data.url);
        await this.apiHealthCheckHandler(data.id, email, response);
        break;
      }
      case 'DELETE': {
        const response = api.delete(data.url);
        await this.apiHealthCheckHandler(data.id, email, response);
        break;
      }
      case 'PATCH': {
        const response = api.patch(data.url);
        await this.apiHealthCheckHandler(data.id, email, response);
        break;
      }
      case 'HEAD': {
        const response = api.head(data.url);
        await this.apiHealthCheckHandler(data.id, email, response);
        break;
      }
    }
  }
}
