import {
  DiscordWebhookResponse,
  DiscordAPIError,
} from 'src/providers/discord/types/discord.types';
import { SendDiscordMessageDto } from './dto/send-discord-message.dto';

export abstract class DiscordProvider {
  abstract sendMessage(
    sendDiscordMessageDto: SendDiscordMessageDto,
  ): Promise<DiscordWebhookResponse | DiscordAPIError>;
}
