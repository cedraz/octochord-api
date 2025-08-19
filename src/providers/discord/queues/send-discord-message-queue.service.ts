import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueNames } from 'src/shared/helpers/queue-names.helper';
import { SendDiscordMessageDto } from '../dto/send-discord-message.dto';

@Injectable()
export class SendDiscordMessageQueueService {
  constructor(
    @InjectQueue(QueueNames.SEND_DISCORD_MESSAGE_QUEUE)
    private sendDiscordMessageQueue: Queue,
  ) {}

  async execute(dto: SendDiscordMessageDto): Promise<void> {
    await this.sendDiscordMessageQueue.add(
      QueueNames.SEND_DISCORD_MESSAGE_QUEUE,
      dto,
    );
  }
}
