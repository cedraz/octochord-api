import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UserController } from './presentation/user.controller';
import { CloudinaryModule } from 'src/providers/cloudinary/cloudinary.module';
import { UserRepository } from './domain/user.repository';
import { UserPrismaRepository } from './infra/implementations/user-prisma.repository';
import { USER_SERVICE_TOKEN } from 'src/shared/tokens/tokens';
import { MailerModule } from 'src/providers/mailer/mailer.module';
import { OneTimeCodeModule } from '../one-time-code/one-time-code.module';

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
  imports: [CloudinaryModule, MailerModule, OneTimeCodeModule],
})
export class UserModule {}
