import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { SendDiscordMessagesDto } from './dto/send-discord-message.dto';
import { api } from 'src/providers/axios';
import { DiscordAPIError, DiscordWebhookResponse } from './types/discord.types';
import { Integration } from './entities/integration.entity';
import * as crypto from 'crypto';
import { PushEvent } from '@octokit/webhooks-types';

@Injectable()
export class IntegrationService {
  constructor(private prismaService: PrismaService) {}

  create(userId: string, createIntegrationDto: CreateIntegrationDto) {
    return this.prismaService.integration.create({
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
  }

  async findIntegrationByHookId(hookId: string): Promise<Integration | null> {
    return this.prismaService.integration.findUnique({
      where: { hookId },
      include: { discordWebhooks: true },
    });
  }

  async sendDiscordMessages(dto: SendDiscordMessagesDto) {
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
            username: dto.username,
            avatar_url:
              'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
          });

          console.log(response);

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

    return await Promise.allSettled(promises);
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
