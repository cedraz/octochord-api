import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { QueueNames } from 'src/shared/helpers/queue-names.helper';
import { SendDiscordMessageDto } from '../../../jobs/dto/send-discord-message.dto';
import { CustomLogger } from 'src/shared/application/logger.service';

@Injectable()
export class SendDiscordMessageQueueService {
  constructor(
    @InjectQueue(QueueNames.SEND_DISCORD_MESSAGE_QUEUE)
    private sendDiscordMessageQueue: Queue<SendDiscordMessageDto, void, string>,
    private readonly logger: CustomLogger,
  ) {}

  async execute(dto: SendDiscordMessageDto): Promise<void> {
    await this.sendDiscordMessageQueue.add(
      QueueNames.SEND_DISCORD_MESSAGE_QUEUE,
      dto,
      {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );
  }

  async retryFailed(): Promise<void> {
    const failedJobs: Job[] = await this.sendDiscordMessageQueue.getFailed();
    if (failedJobs.length === 0) {
      this.logger.log('No failed jobs to retry.');
      return;
    }

    this.logger.log(`Retrying ${failedJobs.length} failed jobs...`);

    for (const job of failedJobs) {
      this.logger.log(`Retrying job ID: ${job.id}`);
      await job.retry();
    }
  }
}
