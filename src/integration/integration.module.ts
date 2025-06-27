import { Module } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';
import { JobsModule } from 'src/jobs/jobs.module';

@Module({
  controllers: [IntegrationController],
  providers: [IntegrationService],
  imports: [JobsModule],
})
export class IntegrationModule {}
