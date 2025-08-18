import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DiscordProvider } from '../discord.provider';
import {
  DiscordWebhookResponse,
  DiscordAPIError,
} from 'src/providers/discord/types/discord.types';
import { api } from 'src/providers/axios';
import { ErrorMessagesHelper } from 'src/shared/helpers/error-messages.helper';
import { CustomLogger } from 'src/shared/application/logger.service';
import { isAxiosError } from 'axios';
import { SendDiscordMessageDto } from '../dto/send-discord-message.dto';

@Injectable()
export class DiscordAdapter implements DiscordProvider {
  constructor(private readonly logger: CustomLogger) {
    this.logger.setContext(DiscordAdapter.name);
  }

  private avatarURL =
    'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';

  async sendMessage({
    content,
    discordWebhookURL,
    username,
  }: SendDiscordMessageDto): Promise<DiscordWebhookResponse> {
    try {
      const response = await api.post<DiscordWebhookResponse>(
        discordWebhookURL,
        {
          content,
          username,
          avatar_url: this.avatarURL,
        },
      );

      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const discordErrorData = error.response?.data as DiscordAPIError;
        const errorMessage = discordErrorData?.message || error.message;

        this.logger.error(
          `Axios error sending message to Discord. Status: ${status} - Message: ${errorMessage}`,
          error.stack,
        );

        if (status && status >= 400 && status < 500) {
          throw new BadRequestException(
            `Failed to send message to Discord: ${errorMessage}`,
          );
        } else {
          throw new ServiceUnavailableException(
            ErrorMessagesHelper.serviceUnavailableError(
              `Discord API is unavailable: ${errorMessage}`,
            ),
          );
        }
      }

      if (error instanceof Error) {
        this.logger.error(
          `Generic error sending message to Discord: ${error.message}`,
          error.stack,
        );
        throw new ServiceUnavailableException(
          ErrorMessagesHelper.serviceUnavailableError(error.message),
        );
      }

      this.logger.error(
        `Unknown error sending message to Discord: ${JSON.stringify(error)}`,
      );
      throw new ServiceUnavailableException(
        ErrorMessagesHelper.serviceUnavailableError(
          'An unknown error occurred.',
        ),
      );
    }
  }
}
