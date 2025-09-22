import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './shared/prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { OneTimeCodeModule } from './modules/one-time-code/one-time-code.module';
import { IntegrationModule } from './modules/integration/integration.module';
import { ApiHealthCheckModule } from './modules/api-health-check/api-health-check.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CustomLogger } from './shared/application/logger.service';
import { env } from './shared/config/env.schema';
import { LoggerInterceptor } from './shared/interceptors/logger-interceptor';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [
    BullModule.forRoot({ connection: { url: env.REDIS_URL } }),
    ScheduleModule.forRoot(),
    AuthModule,
    PrismaModule,
    UserModule,
    OneTimeCodeModule,
    IntegrationModule,
    ApiHealthCheckModule,
    JobsModule,
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
