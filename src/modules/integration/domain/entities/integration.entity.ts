import { DiscordWebhookEntity } from './discord-webhook.entity';
import { EmailIntegrationEntity } from './email-integration.entity';

export class IntegrationEntity {
  hookId: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  githubWebhookSecret: string;

  discordWebhooks: DiscordWebhookEntity[];
  emailIntegration?: EmailIntegrationEntity | null;

  constructor(partial: Partial<IntegrationEntity>) {
    Object.assign(this, partial);
  }
}
