export class DiscordWebhookEntity {
  discordWebhookURL: string;
  hookId: string;

  constructor(partial: Partial<DiscordWebhookEntity>) {
    Object.assign(this, partial);
  }
}
