import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { ErrorMessagesHelper } from 'src/shared/helpers/error-messages.helper';
import { env } from 'src/shared/config/env.schema';
import { UserServiceAPI } from 'src/modules/user/application/user.service.interface';
import {
  OTC_SERVICE_TOKEN,
  USER_SERVICE_TOKEN,
} from 'src/shared/tokens/tokens';
import { VerificationType } from 'src/shared/enums/verification-type.enum';
import { nanoid } from 'nanoid';
import { RefreshTokenRepository } from '../domain/refresh-token.repository';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TRefreshTokenPayload } from 'src/shared/types/jwt-payload.interface';
import { TokenResponseDto } from './dto/token-response.dto';
import { MessageResponseDto } from 'src/shared/dto/message-response.dto';
import { OneTimeCodeServiceAPI } from 'src/modules/one-time-code/application/one-time-code.service.interface';
@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_SERVICE_TOKEN)
    private readonly userService: UserServiceAPI,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
    @Inject(OTC_SERVICE_TOKEN)
    private readonly oneTimeCodeService: OneTimeCodeServiceAPI,
  ) {}

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException(ErrorMessagesHelper.EMAIL_NOT_VERIFIED);
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(ErrorMessagesHelper.INVALID_CREDENTIALS);
    }

    const { accessToken, refreshToken } = await this.generateTokens(user.id);

    return {
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(
    userId: string,
    verificationType?: VerificationType,
  ): Promise<TokenResponseDto> {
    const nanoId = nanoid();

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, type: verificationType },
        { secret: env.ACCESS_TOKEN_SECRET, expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, jti: nanoId },
        { secret: env.REFRESH_TOKEN_SECRET, expiresIn: '7d' },
      ),
    ]);

    const hashedToken = await bcrypt.hash(refreshToken, 6);

    await this.refreshTokenRepository.create({
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      hashedToken,
      jti: nanoId,
      userId,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    const { refreshToken } = refreshTokenDto;

    const payload = this.jwtService.verify<TRefreshTokenPayload>(refreshToken, {
      secret: env.REFRESH_TOKEN_SECRET,
    });

    const storedToken = await this.refreshTokenRepository.findByJti(
      payload.jti,
    );

    if (
      !storedToken ||
      !(await bcrypt.compare(refreshToken, storedToken.hashedToken))
    ) {
      throw new UnauthorizedException(ErrorMessagesHelper.INVALID_TOKEN);
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(payload.sub);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string): Promise<MessageResponseDto> {
    await this.refreshTokenRepository.logout(userId);

    return { message: 'User logged out successfully' };
  }

  // async verifyEmail(validateOneTimeCodeDto: ValidateOneTimeCodeDto) {
  //   const oneTimeCode = await this.oneTimeCodeService.

  //   if (!oneTimeCode || this.isOneTimeCodeExpired(oneTimeCode)) {
  //     throw new ConflictException(
  //       ErrorMessagesHelper.INVALID_VERIFICATION_REQUEST,
  //     );
  //   }
  // }
}
