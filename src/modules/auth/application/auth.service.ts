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
import { ValidateOneTimeCodeDto } from 'src/modules/one-time-code/application/dto/validate-one-time-code.dto';
import { OTCMetadata } from 'src/shared/types/metadata';

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

  async verifyEmail(
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

    const user = await this.userService.findByEmail(
      validateOneTimeCodeDto.identifier,
    );

    await this.userService.update(user.id, {
      emailVerifiedAt: new Date(),
    });

    return {
      message: 'Email verified successfully',
    };
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
        metadata: {
          userId: user.id,
        },
      },
      expiresIn: this.oneTimeCodeService.getOneTimeCodeExpirationTime(),
    });

    return {
      message: 'Novo código de verificação enviado para o novo e-mail.',
    };
  }

  async validateChangeEmailOTC(
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

    const metadata = oneTimeCode.metadata as unknown as OTCMetadata;

    if (!metadata || !metadata.userId) {
      throw new ConflictException(ErrorMessagesHelper.INVALID_METADATA);
    }

    const userWithSameEmail = await this.userService.findByEmail(
      validateOneTimeCodeDto.identifier,
    );

    if (userWithSameEmail) {
      throw new ConflictException(ErrorMessagesHelper.USER_ALREADY_EXISTS);
    }

    const user = await this.userService.findById(metadata.userId);

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

  async recoverPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    const salt = await bcrypt.genSalt(8);
    const passwordHash = await bcrypt.hash(password, salt);

    const userUpdated = await this.userService.update(user.id, {
      passwordHash,
    });

    console.log('Password recovered for user:', userUpdated);

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
