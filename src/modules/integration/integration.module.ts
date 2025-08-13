import { Module } from '@nestjs/common';
import { JobsModule } from 'src/jobs/jobs.module';
import { IntegrationController } from './presentation/integration.controller';
import { IntegrationService } from './application/integration.service';
import { IntegrationRepository } from './domain/integration.repository';
import { IntegrationPrismaRepository } from './infra/implementations/integration-prisma.repository';

@Module({
  controllers: [IntegrationController],
  providers: [
    {
      provide: IntegrationRepository,
      useClass: IntegrationPrismaRepository,
    },
    IntegrationService,
  ],
  imports: [JobsModule],
})
export class IntegrationModule {}
