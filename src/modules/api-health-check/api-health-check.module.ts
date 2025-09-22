import { Module } from '@nestjs/common';
import { ApiHealthCheckService } from './application/api-health-check.service';
import { BullModule } from '@nestjs/bullmq';
import { ApiHealthCheckConsumerService } from './application/consumers/api-health-check-consumer.service';
import { ApiHealthCheckQueueService } from './application/queue/api-health-check-queue.service';
import { QueueNames } from 'src/shared/helpers/queue-names.helper';
import { MailerModule } from 'src/providers/nodemailer/mailer.module';
import { ApiHealthCheckController } from './presentation/api-health-check.controller';
import { ApiHealthCheckRepository } from './domain/api-health-check.repository';
import { ApiHealthCheckPrismaRepository } from './infra/implementations/api-health-check-prisma.repository';
import { UserModule } from '../user/user.module';
import { UnitOfWork } from 'src/shared/domain/unit-of-work';
import { PrismaUnitOfWork } from 'src/shared/prisma/prisma.unit-of-work';

@Module({
  controllers: [ApiHealthCheckController],
  providers: [
    {
      provide: ApiHealthCheckRepository,
      useClass: ApiHealthCheckPrismaRepository,
    },
    {
      provide: UnitOfWork,
      useClass: PrismaUnitOfWork,
    },
    ApiHealthCheckService,
    ApiHealthCheckConsumerService,
    ApiHealthCheckQueueService,
  ],
  imports: [
    BullModule.registerQueue({ name: QueueNames.API_HEALTH_CHECK_QUEUE }),
    MailerModule,
    UserModule,
  ],
})
export class ApiHealthCheckModule {}
