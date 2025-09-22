import { Inject, Injectable } from '@nestjs/common';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { GithubNotificationDto } from './dto/send-discord-message.dto';
import * as crypto from 'crypto';
import { PushEvent } from '@octokit/webhooks-types';
import { IntegrationEntity } from '../domain/entities/integration.entity';
import { IntegrationRepository } from '../domain/integration.repository';
import { IQueueProvider } from 'src/shared/domain/providers/queue.provider';
import { QUEUE_PROVIDER_TOKEN } from 'src/shared/tokens/tokens';
import { QueueNames } from 'src/shared/helpers/queue-names.helper';

@Injectable()
export class IntegrationService {
  constructor(
    private readonly integrationRepository: IntegrationRepository,
    @Inject(QUEUE_PROVIDER_TOKEN)
    private readonly queueProvider: IQueueProvider,
  ) {}

  async create(userId: string, createIntegrationDto: CreateIntegrationDto) {
    const integration = await this.integrationRepository.create(
      userId,
      createIntegrationDto,
    );

    if (createIntegrationDto.createEmailIntegrationDto) {
      await this.integrationRepository.createEmailIntegration(
        integration.hookId,
        createIntegrationDto.createEmailIntegrationDto,
      );
    }

    return integration;
  }

  findIntegrationByHookId(hookId: string): Promise<IntegrationEntity | null> {
    return this.integrationRepository.findIntegrationByHookId(hookId);
  }

  async handleNotification(dto: GithubNotificationDto): Promise<void> {
    if (dto.integration.emailIntegration) {
      const promises = dto.integration.emailIntegration.emails.map(
        async (email) => {
          await this.queueProvider.add({
            queueName: QueueNames.SEND_EMAIL_QUEUE,
            jobName: 'send-email-job',
            payload: {
              to: email,
              subject: `New push event in ${dto.payload.repository.full_name}`,
              message: `
                New push event received for repository: ${dto.payload.repository.full_name}
                \nCommit: ${dto.payload.head_commit?.message || 'No commit message'}
                \nPusher: ${dto.payload.pusher.name}
              `,
            },
          });
        },
      );

      await Promise.all([this.sendDiscordMessages(dto), promises]);
    }
  }

  async sendDiscordMessages(dto: GithubNotificationDto) {
    const promises = dto.integration.discordWebhooks.map(
      async (discordWebhook) => {
        const content = `
            New push event received for repository: ${dto.payload.repository.full_name}
            \nCommit: ${dto.payload.head_commit?.message || 'No commit message'}
            \nPusher: ${dto.payload.pusher.name}
        `;

        return this.queueProvider.add({
          queueName: QueueNames.SEND_DISCORD_MESSAGE_QUEUE,
          jobName: 'send-discord-message-job',
          payload: {
            content,
            discordWebhookURL: discordWebhook.discordWebhookURL,
            username: dto.payload.pusher.name,
          },
          opts: {
            attempts: 5,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
          },
        });
      },
    );

    await Promise.all(promises);
  }

  verifySignature(
    signature: string,
    secret: string,
    payload: PushEvent,
  ): boolean {
    if (!signature || !secret) return false;

    const hmac = crypto.createHmac('sha256', secret);
    const digest =
      'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  }
}
