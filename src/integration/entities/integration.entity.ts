export class DiscordWebhook {
  discordWebhookURL: string;
  hookId: string;
}

export class IntegrationSimple {
  hookId: string;
  name: string;
  githubWebhookSecret: string;
  userId: string;
  discordWebhooks: DiscordWebhook[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

class EmailIntegration {
  id: number;
  emails: string[];
}

export class Integration extends IntegrationSimple {
  emailIntegration: EmailIntegration | null;
}
