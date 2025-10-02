import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailerProvider } from '../mailer.provider';
import { SendEmailDto } from '../dto/send-email.dto';
import { QueueNames } from 'src/shared/helpers/queue-names.helper';
import { CustomLogger } from 'src/shared/application/logger.service';

@Processor(QueueNames.SEND_EMAIL_QUEUE)
export class SendEmailConsumerService extends WorkerHost {
  constructor(
    private mailerService: MailerProvider,
    private readonly logger: CustomLogger,
  ) {
    super();
  }

  async process({ data }: Job<SendEmailDto>) {
    const { to, message, subject } = data;

    try {
      await this.mailerService.sendEmail({ to, message, subject });
    } catch (error) {
      this.logger.error('Error sending email', error);
    }
  }
}
