import { Injectable } from '@nestjs/common';

@Injectable()
export class IntegrationService {
  // create(createIntegrationDto: CreateIntegrationDto) {
  //   const githubWebhookSecret = 'githubwebhooksecret';
  //   const discordWehookURL =
  //     'https://discordapp.com/api/webhooks/1384400385447563437/7ZHX3Lezfo5jU1nL0j-LXy1BFvmKpCqpUf8LwP0Uu4R5APph5UDhM--v1J3sK5wyjbjh';
  // }

  async sendDiscordMessage(message: string) {
    const webhookURL =
      'https://discordapp.com/api/webhooks/1384400385447563437/7ZHX3Lezfo5jU1nL0j-LXy1BFvmKpCqpUf8LwP0Uu4R5APph5UDhM--v1J3sK5wyjbjh';

    await fetch(webhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: message,
        username: 'GitHub Updates',
        avatar_url:
          'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
      }),
    });
  }
}
