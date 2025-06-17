import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { StripeModule } from './providers/stripe/stripe.module';
import { env, validate } from './config/env-validation';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ViaCepModule } from './providers/via-cep/via-cep.module';
import { JobsModule } from './jobs/jobs.module';
import { MailerModule } from './providers/mailer/mailer.module';
import { CloudinaryModule } from './providers/cloudinary/cloudinary.module';
import { GoogleSheetsModule } from './providers/google-sheets/google-sheets.module';
import { OneTimeCodeModule } from './one-time-code/one-time-code.module';
import { IntegrationModule } from './integration/integration.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validate }),
    JwtModule.register({ global: true }),
    BullModule.forRoot({ connection: { url: env.REDIS_URL } }),
    ScheduleModule.forRoot(),
    AuthModule,
    PrismaModule,
    UserModule,
    JobsModule,
    CloudinaryModule,
    ViaCepModule,
    MailerModule,
    GoogleSheetsModule,
    StripeModule,
    OneTimeCodeModule,
    IntegrationModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
