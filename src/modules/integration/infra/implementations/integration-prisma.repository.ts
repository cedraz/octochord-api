import { Injectable } from '@nestjs/common';
import { IntegrationRepository } from '../../domain/integration.repository';
import { CreateIntegrationDto } from '../../application/dto/create-integration.dto';
import { IntegrationEntity } from '../../domain/entities/integration.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateEmailIntegrationDto } from '../../application/dto/create-email-integration.dto';
import { EmailIntegrationEntity } from '../../domain/entities/email-integration.entity';

@Injectable()
export class IntegrationPrismaRepository implements IntegrationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    createIntegrationDto: CreateIntegrationDto,
  ): Promise<IntegrationEntity> {
    const integration = await this.prisma.integration.create({
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

    return new IntegrationEntity({
      hookId: integration.hookId,
      name: integration.name,
      userId: integration.userId,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
      deletedAt: integration.deletedAt,
      githubWebhookSecret: integration.githubWebhookSecret,
      discordWebhooks: [],
      emailIntegration: null,
    });
  }

  async createEmailIntegration(
    integrationId: string,
    createEmailIntegrationDto: CreateEmailIntegrationDto,
  ): Promise<EmailIntegrationEntity> {
    const emailIntegration = await this.prisma.emailIntegration.create({
      data: {
        emails: createEmailIntegrationDto.emails,
        integration: { connect: { hookId: integrationId } },
      },
    });

    return new EmailIntegrationEntity({
      id: emailIntegration.id,
      emails: emailIntegration.emails,
      integrationId: emailIntegration.integrationId,
    });
  }

  async findIntegrationByHookId(
    hookId: string,
  ): Promise<IntegrationEntity | null> {
    const integration = await this.prisma.integration.findUnique({
      where: { hookId },
      include: { discordWebhooks: true, emailIntegration: true },
    });

    if (!integration) {
      return null;
    }

    return new IntegrationEntity({
      hookId: integration.hookId,
      name: integration.name,
      userId: integration.userId,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt,
      deletedAt: integration.deletedAt,
      githubWebhookSecret: integration.githubWebhookSecret,
      discordWebhooks: integration.discordWebhooks,
      emailIntegration: integration.emailIntegration
        ? new EmailIntegrationEntity(integration.emailIntegration)
        : null,
    });
  }
}
