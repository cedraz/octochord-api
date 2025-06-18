import { Integration } from '../entities/integration.entity';
import { PushEvent } from '@octokit/webhooks-types';

export class SendDiscordMessagesDto {
  payload: PushEvent;
  username: string;
  integration: Integration;
}
