import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailerProvider } from '../mailer.provider';
import { SendEmailDto } from '../dto/send-email.dto';
import { QueueNames } from 'src/shared/helpers/queue-names.helper';

@Processor(QueueNames.SEND_EMAIL_QUEUE)
export class SendEmailConsumerService extends WorkerHost {
  constructor(private mailerService: MailerProvider) {
    super();
  }

  async process({ data }: Job<SendEmailDto>) {
    const { to, message, subject } = data;

    await this.mailerService.sendEmail({ to, message, subject });
  }
}
