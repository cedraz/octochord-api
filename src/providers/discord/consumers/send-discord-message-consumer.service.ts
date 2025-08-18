import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QueueNames } from 'src/shared/helpers/queue-names.helper';
import { SendDiscordMessageDto } from '../dto/send-discord-message.dto';
import { DiscordProvider } from '../discord.provider';
import { CustomLogger } from 'src/shared/application/logger.service';

@Processor(QueueNames.SEND_DISCORD_MESSAGE_QUEUE)
export class SendDiscordMessageConsumer extends WorkerHost {
  constructor(
    private readonly discordService: DiscordProvider,
    private readonly logger: CustomLogger,
  ) {
    logger.setContext(SendDiscordMessageConsumer.name);
    super();
  }

  async process({ data }: Job<SendDiscordMessageDto>) {
    this.logger.log(`Processing Discord message: ${JSON.stringify(data)}`);
    await this.discordService.sendMessage(data);
    this.logger.log(
      `Discord message sent successfully: ${JSON.stringify(data)}`,
    );
  }
}
