export class DiscordWebhook {
  discordWebhookURL: string;
  hookId: string;
}

export class Integration {
  hookId: string;
  name: string;
  githubWebhookSecret: string;
  userId: string;
  discordWebhooks: DiscordWebhook[];
}
