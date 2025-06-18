import { Module } from '@nestjs/common';
import { ApiHealthCheckService } from './api-health-check.service';
import { ApiHealthCheckController } from './api-health-check.controller';
import { JobsModule } from 'src/jobs/jobs.module';

@Module({
  controllers: [ApiHealthCheckController],
  providers: [ApiHealthCheckService],
  imports: [JobsModule],
})
export class ApiHealthCheckModule {}
