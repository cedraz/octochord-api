import { Module } from '@nestjs/common';
import { OneTimeCodeService } from './one-time-code.service';
import { OneTimeCodeController } from './one-time-code.controller';
import { JobsModule } from 'src/jobs/jobs.module';

@Module({
  providers: [OneTimeCodeService],
  exports: [OneTimeCodeService],
  controllers: [OneTimeCodeController],
  imports: [JobsModule],
})
export class OneTimeCodeModule {}
