import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SendEmailDto } from 'src/jobs/dto/send-email.dto';
import { NodemailerMailerAdapter } from 'src/adapters/nodemailer/nodemailer.mailer.adapter';
import { QueueNames } from 'src/shared/helpers/queue-names.helper';

@Processor(QueueNames.SEND_EMAIL_QUEUE)
export class SendEmailConsumer extends WorkerHost {
  constructor(private mailerService: NodemailerMailerAdapter) {
    super();
  }

  async process({ data }: Job<SendEmailDto>) {
    const { to, message, subject } = data;

    await this.mailerService.sendMail({ to, message, subject });
  }
}
