import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './application/auth.service';
import { AuthController } from './presentation/auth.controller';
import { UserModule } from '../user/user.module';
import { RefreshTokenRepository } from './domain/refresh-token.repository';
import { RefreshTokenPrismaRepository } from './infra/implementations/refresh-token-prisma.repository';
import { AccessTokenStrategy } from './application/strategies/access-token.strategy';
import { RefreshTokenStrategy } from './application/strategies/refresh-token.strategy';
import { OneTimeCodeModule } from '../one-time-code/one-time-code.module';
import { GoogleStrategy } from './application/strategies/google-oauth.strategy';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    GoogleStrategy,
    {
      provide: RefreshTokenRepository,
      useClass: RefreshTokenPrismaRepository,
    },
  ],
  imports: [
    JwtModule.register({ global: true }),
    UserModule,
    OneTimeCodeModule,
  ],
})
export class AuthModule {}
