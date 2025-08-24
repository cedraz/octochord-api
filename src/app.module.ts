import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './shared/prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { ViaCepModule } from './providers/via-cep/via-cep.module';
import { CloudinaryModule } from './providers/cloudinary/cloudinary.module';
import { OneTimeCodeModule } from './modules/one-time-code/one-time-code.module';
import { IntegrationModule } from './modules/integration/integration.module';
import { ApiHealthCheckModule } from './modules/api-health-check/api-health-check.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CustomLogger } from './shared/application/logger.service';
import { env } from './shared/config/env.schema';
import { LoggerInterceptor } from './shared/interceptors/logger-interceptor';

@Module({
  imports: [
    BullModule.forRoot({ connection: { url: env.REDIS_URL } }),
    ScheduleModule.forRoot(),
    AuthModule,
    PrismaModule,
    UserModule,
    CloudinaryModule,
    ViaCepModule,
    OneTimeCodeModule,
    IntegrationModule,
    ApiHealthCheckModule,
  ],
  controllers: [AppController],
  providers: [
    CustomLogger,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
})
export class AppModule {}
