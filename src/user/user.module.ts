import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { OneTimeCodeService } from 'src/one-time-code/one-time-code.service';
import { OneTimeCodeModule } from 'src/one-time-code/one-time-code.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { CloudinaryModule } from 'src/providers/cloudinary/cloudinary.module';

@Module({
  controllers: [UserController],
  providers: [UserService, OneTimeCodeService],
  exports: [UserService],
  imports: [OneTimeCodeModule, JobsModule, CloudinaryModule],
})
export class UserModule {}
