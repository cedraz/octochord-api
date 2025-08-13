import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserController } from './presentation/user.controller';
import { JobsModule } from 'src/jobs/jobs.module';
import { CloudinaryModule } from 'src/providers/cloudinary/cloudinary.module';
import { UserRepository } from './domain/user.repository';
import { UserPrismaRepository } from './infra/implementations/user-prisma.repository';
import { USER_SERVICE_TOKEN } from 'src/common/tokens/tokens';
import { SharedModule } from 'src/common/modules/shared.module';

@Module({
  controllers: [UserController],
  providers: [
    {
      provide: UserRepository,
      useClass: UserPrismaRepository,
    },
    {
      provide: USER_SERVICE_TOKEN,
      useClass: UserService,
    },
  ],
  exports: [USER_SERVICE_TOKEN],
  imports: [SharedModule, JobsModule, CloudinaryModule],
})
export class UserModule {}
