import { Module } from '@nestjs/common';
import { DiscordProvider } from './discord.provider';
import { DiscordAdapter } from './adapters/discord.adapter';
import { BullModule } from '@nestjs/bullmq';
import { QueueNames } from 'src/shared/helpers/queue-names.helper';
import { SendDiscordMessageConsumer } from './consumers/send-discord-message-consumer.service';
import { SendDiscordMessageQueueService } from './queues/send-discord-message-queue.service';
import { CustomLogger } from 'src/shared/application/logger.service';

@Module({
  providers: [
    { provide: DiscordProvider, useClass: DiscordAdapter },
    SendDiscordMessageConsumer,
    SendDiscordMessageQueueService,
    CustomLogger,
  ],
  exports: [DiscordProvider, SendDiscordMessageQueueService],
  imports: [
    BullModule.registerQueue({ name: QueueNames.SEND_DISCORD_MESSAGE_QUEUE }),
  ],
})
export class DiscordModule {}
