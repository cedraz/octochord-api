import { Module } from '@nestjs/common';
import { MailerProvider } from './mailer.provider';
import { NodemailerAdapter } from './adapters/nodemailer.adapter';
import { SendEmailConsumerService } from './consumers/send-email-consumer.service';
import { SendEmailQueueService } from './queue/send-email-queue.service';
import { BullModule } from '@nestjs/bullmq';
import { QueueNames } from 'src/shared/helpers/queue-names.helper';
import { CustomLogger } from 'src/shared/application/logger.service';

@Module({
  providers: [
    { provide: MailerProvider, useClass: NodemailerAdapter },
    SendEmailConsumerService,
    SendEmailQueueService,
    CustomLogger,
  ],
  exports: [MailerProvider, SendEmailQueueService],
  imports: [BullModule.registerQueue({ name: QueueNames.SEND_EMAIL_QUEUE })],
})
export class MailerModule {}
