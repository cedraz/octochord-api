import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { GithubNotificationDto } from './dto/send-discord-message.dto';
import { api } from 'src/providers/axios';
import { DiscordAPIError, DiscordWebhookResponse } from './types/discord.types';
import { Integration } from './entities/integration.entity';
import * as crypto from 'crypto';
import { PushEvent } from '@octokit/webhooks-types';
import { SendEmailQueueService } from 'src/jobs/queues/send-email-queue.service';

@Injectable()
export class IntegrationService {
  constructor(
    private prismaService: PrismaService,
    private sendEmailQueueService: SendEmailQueueService,
  ) {}

  async create(userId: string, createIntegrationDto: CreateIntegrationDto) {
    const integration = await this.prismaService.integration.create({
      data: {
        name: createIntegrationDto.name,
        githubWebhookSecret: createIntegrationDto.githubWebhookSecret,
        hookId: createIntegrationDto.hookId,
        discordWebhooks: {
          createMany: {
            data: createIntegrationDto.discordWebhookURLs.map((url) => ({
              discordWebhookURL: url,
            })),
          },
        },
        user: { connect: { id: userId } },
      },
    });

    if (createIntegrationDto.createEmailIntegrationDto) {
      await this.prismaService.emailIntegration.create({
        data: {
          emails: createIntegrationDto.createEmailIntegrationDto.emails,
          integration: { connect: { hookId: integration.hookId } },
        },
      });
    }

    return integration;
  }

  findIntegrationByHookId(hookId: string): Promise<Integration | null> {
    return this.prismaService.integration.findUnique({
      where: { hookId },
      include: { discordWebhooks: true, emailIntegration: true },
    });
  }

  async handleNotification(
    dto: GithubNotificationDto,
  ): Promise<DiscordWebhookResponse[]> {
    if (dto.integration.emailIntegration) {
      const promises = dto.integration.emailIntegration.emails.map(
        async (email) => {
          await this.sendEmailQueueService.execute({
            to: email,
            subject: `New push event in ${dto.payload.repository.full_name}`,
            message: `
            New push event received for repository: ${dto.payload.repository.full_name}
            \nCommit: ${dto.payload.head_commit.message}
            \nPusher: ${dto.payload.pusher.name}
          `,
          });
        },
      );

      const [discordWebhookResponses, _] = await Promise.all([
        this.sendDiscordMessages(dto),
        promises,
      ]);

      return discordWebhookResponses;
    }
  }

  async sendDiscordMessages(
    dto: GithubNotificationDto,
  ): Promise<DiscordWebhookResponse[]> {
    const promises = dto.integration.discordWebhooks.map(
      async (discordWebhook) => {
        try {
          const content = `
            New push event received for repository: ${dto.payload.repository.full_name}
            \nCommit: ${dto.payload.head_commit.message}
            \nPusher: ${dto.payload.pusher.name}
        `;

          const response = await api.post<
            DiscordWebhookResponse | DiscordAPIError
          >(discordWebhook.discordWebhookURL, {
            content,
            username: dto.payload.pusher.name,
            avatar_url:
              'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
          });

          if (response.status > 204) {
            const error = response.data as DiscordAPIError;
            throw new Error(error.message);
          }

          return response.data as DiscordWebhookResponse;
        } catch (error) {
          console.error('Erro ao enviar mensagem para o Discord:', error);
          throw new ServiceUnavailableException(
            ErrorMessagesHelper.serviceUnavailableError(error as string),
          );
        }
      },
    );

    return await Promise.all(promises);
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
