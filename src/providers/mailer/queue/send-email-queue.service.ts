import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { SendEmailDto } from '../dto/send-email.dto';
import { QueueNames } from 'src/shared/helpers/queue-names.helper';

@Injectable()
export class SendEmailQueueService {
  constructor(
    @InjectQueue(QueueNames.SEND_EMAIL_QUEUE)
    private sendEmailQueue: Queue,
  ) {}

  async execute({ to, message, subject }: SendEmailDto): Promise<void> {
    await this.sendEmailQueue.add(QueueNames.SEND_EMAIL_QUEUE, {
      to,
      message,
      subject,
    });
  }
}
