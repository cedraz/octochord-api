import { Module } from '@nestjs/common';
import { SendEmailConsumerService } from './consumers/send-email-consumer.service';
import { SendEmailQueueService } from './queues/send-email-queue.service';
import { MailerService } from 'src/providers/mailer/mailer.service';
import { BullModule } from '@nestjs/bullmq';
import { GoogleSheetsService } from 'src/providers/google-sheets/google-sheets.service';
import { IngestEventQueueService } from './queues/ingest-event-queue.service';
import { IngestEventConsumerService } from './consumers/ingest-event-consumer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueueNames } from './utils/queue-names.helper';
import { ClearOneTimeCodesConsumerService } from './consumers/clear-one-time-codes-consumer.service';
import { ClearOneTimeCodesQueueService } from './queues/clear-one-time-codes-queue.service';
import { ApiHealthCheckQueueService } from './queues/api-health-check-queue.service';
import { ApiHealthCheckConsumerService } from './consumers/api-health-check-consumer.service';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: QueueNames.SEND_EMAIL_QUEUE,
      },
      {
        name: QueueNames.INGEST_EVENT_QUEUE,
      },
      {
        name: QueueNames.CLEAR_ONE_TIME_CODES_QUEUE,
      },
      {
        name: QueueNames.API_HEALTH_CHECK_QUEUE,
      },
    ),
  ],
  providers: [
    MailerService,
    GoogleSheetsService,
    PrismaService,
    SendEmailConsumerService,
    SendEmailQueueService,
    IngestEventQueueService,
    IngestEventConsumerService,
    ClearOneTimeCodesQueueService,
    ClearOneTimeCodesConsumerService,
    ApiHealthCheckQueueService,
    ApiHealthCheckConsumerService,
  ],
  exports: [
    SendEmailQueueService,
    IngestEventQueueService,
    ApiHealthCheckQueueService,
  ],
})
export class JobsModule {}
