import { Module } from '@nestjs/common';
import { OneTimeCodeService } from './application/one-time-code.service';
import { OneTimeCodeController } from './presentation/one-time-code.controller';
import { OneTimeCodeRepository } from './domain/one-time-code.repository';
import { OneTimeCodePrismaRepository } from './infra/implementations/one-time-code-prisma.repository';
import { OTC_SERVICE_TOKEN } from 'src/shared/tokens/tokens';
import { MailerModule } from 'src/providers/nodemailer/mailer.module';

@Module({
  providers: [
    {
      provide: OneTimeCodeRepository,
      useClass: OneTimeCodePrismaRepository,
    },
    {
      provide: OTC_SERVICE_TOKEN,
      useClass: OneTimeCodeService,
    },
  ],
  exports: [OTC_SERVICE_TOKEN],
  controllers: [OneTimeCodeController],
  imports: [MailerModule],
})
export class OneTimeCodeModule {}
