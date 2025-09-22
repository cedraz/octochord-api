import { Module } from '@nestjs/common';
import { IntegrationController } from './presentation/integration.controller';
import { IntegrationService } from './application/integration.service';
import { IntegrationRepository } from './domain/integration.repository';
import { IntegrationPrismaRepository } from './infra/implementations/integration-prisma.repository';
import { MailerModule } from 'src/providers/nodemailer/mailer.module';
import { DiscordModule } from 'src/providers/discord/discord.module';

@Module({
  controllers: [IntegrationController],
  providers: [
    {
      provide: IntegrationRepository,
      useClass: IntegrationPrismaRepository,
    },
    IntegrationService,
  ],
  imports: [MailerModule, DiscordModule],
})
export class IntegrationModule {}
