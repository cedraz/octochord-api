import {
  ConflictException,
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
import { VerificationType } from 'src/shared/domain/enums/verification-type.enum';
import { nanoid } from 'nanoid';
import { RefreshTokenRepository } from '../domain/refresh-token.repository';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TRefreshTokenPayload } from 'src/shared/types/jwt-payload';
import { TokenResponseDto } from './dto/token-response.dto';
import { MessageResponseDto } from 'src/shared/application/dto/message-response.dto';
import { OneTimeCodeServiceAPI } from 'src/modules/one-time-code/application/one-time-code.service.interface';
import { ValidateOneTimeCodeDto } from 'src/shared/application/dto/validate-one-time-code.dto';
import { RecoverPasswordDto } from './dto/recover-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Request } from 'express';
import { GoogleUser } from '../domain/types';

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

  googleLogin(user: GoogleUser) {
    // todo implementar autenticação com o usuário do google
    return {
      message: 'Google login successful',
      user,
    };
  }

  async login(loginDto: LoginDto, request: Request): Promise<TokenResponseDto> {
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

    console.log(request.headers['user-agent'] || 'unkown');

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      request.headers['user-agent'] || 'unkown',
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async generateTokens(
    userId: string,
    userAgent: string,
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

    await this.refreshTokenRepository.deleteMany(userId, userAgent);

    const hashedToken = await bcrypt.hash(refreshToken, 6);

    await this.refreshTokenRepository.create({
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      hashedToken,
      jti: nanoId,
      userId,
      userAgent,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(
    refreshTokenDto: RefreshTokenDto,
    request: Request,
  ): Promise<TokenResponseDto> {
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

    const userAgent = request.headers['user-agent'] || 'unkown';

    const { accessToken, refreshToken: newRefreshToken } =
      await this.generateTokens(payload.sub, userAgent);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId: string): Promise<MessageResponseDto> {
    await this.refreshTokenRepository.deleteMany(userId);

    return { message: 'User logged out successfully' };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<MessageResponseDto> {
    const { identifier, code } = dto;

    const oneTimeCode = await this.oneTimeCodeService.findByIdentifier({
      identifier: identifier,
      code: code,
      type: VerificationType.EMAIL_VERIFICATION,
    });

    if (!oneTimeCode || new Date() > oneTimeCode.expiresAt) {
      throw new ConflictException(
        ErrorMessagesHelper.INVALID_VERIFICATION_REQUEST,
      );
    }

    const user = await this.userService.findByEmail(identifier);

    if (!user) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    await Promise.all([
      this.userService.update(user.id, { emailVerifiedAt: new Date() }),
      this.oneTimeCodeService.delete(oneTimeCode.id),
    ]);

    return { message: 'Email verified successfully' };
  }

  async createChangeEmailOTC(
    userId: string,
    newEmail: string,
  ): Promise<MessageResponseDto> {
    const userWithSameEmail = await this.userService.findByEmail(newEmail);

    if (userWithSameEmail) {
      throw new ConflictException(ErrorMessagesHelper.USER_ALREADY_EXISTS);
    }

    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    if (!user.emailVerifiedAt) {
      throw new ConflictException(ErrorMessagesHelper.EMAIL_NOT_VERIFIED);
    }

    await this.oneTimeCodeService.createOneTimeCode({
      createOneTimeCodeDto: {
        identifier: newEmail,
        type: VerificationType.EMAIL_VERIFICATION,
      },
      expirationDate: this.oneTimeCodeService.getOneTimeCodeExpirationTime(),
    });

    return {
      message: 'Novo código de verificação enviado para o novo e-mail.',
    };
  }

  async validateChangeEmailOTC(
    userId: string,
    validateOneTimeCodeDto: ValidateOneTimeCodeDto,
  ): Promise<MessageResponseDto> {
    const oneTimeCode = await this.oneTimeCodeService.findByIdentifier({
      identifier: validateOneTimeCodeDto.identifier,
      code: validateOneTimeCodeDto.code,
      type: validateOneTimeCodeDto.type,
    });

    if (!oneTimeCode || new Date() > oneTimeCode.expiresAt) {
      throw new ConflictException(
        ErrorMessagesHelper.INVALID_VERIFICATION_REQUEST,
      );
    }

    const userWithSameEmail = await this.userService.findByEmail(
      validateOneTimeCodeDto.identifier,
    );

    if (userWithSameEmail) {
      throw new ConflictException(ErrorMessagesHelper.USER_ALREADY_EXISTS);
    }

    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    await Promise.all([
      this.userService.update(user.id, {
        email: validateOneTimeCodeDto.identifier,
        emailVerifiedAt: new Date(),
      }),
      this.logout(user.id),
      this.oneTimeCodeService.delete(oneTimeCode.id),
    ]);

    return { message: 'Email changed successfully' };
  }

  async recoverPassword(
    recoverPasswordDto: RecoverPasswordDto,
  ): Promise<MessageResponseDto> {
    const { email, password } = recoverPasswordDto;

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    const salt = await bcrypt.genSalt(8);
    const passwordHash = await bcrypt.hash(password, salt);

    await this.userService.update(user.id, {
      passwordHash,
    });

    return { message: 'Senha alterada com sucesso.' };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<MessageResponseDto> {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new ConflictException(ErrorMessagesHelper.INVALID_PASSWORD);
    }

    const salt = await bcrypt.genSalt(8);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.userService.update(user.id, { passwordHash });

    return { message: 'Senha alterada com sucesso.' };
  }
}
