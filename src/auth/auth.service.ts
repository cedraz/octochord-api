import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { JwtPayload } from 'src/common/types/jwt-payload.interface';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';
import { env } from 'src/config/env-validation';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: loginDto.email,
      },
    });

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

    const accessTokenExpiresIn = new Date(
      new Date().getTime() + 4 * 60 * 60 * 1000,
    ); // 4 hours

    const refreshTokenExpiresIn = new Date(
      new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
    ); // 7 days

    const accessTokenPayload = {
      sub: user.id,
      expiresIn: accessTokenExpiresIn, // 4 hours
    };

    const refreshTokenPayload = {
      sub: user.id,
      expiresIn: refreshTokenExpiresIn, // 7 days
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      userWithoutPassword,
      accessToken: await this.jwtService.signAsync(accessTokenPayload, {
        expiresIn: '4h',
        secret: env.ACCESS_TOKEN_SECRET,
      }),
      refreshToken: await this.jwtService.signAsync(refreshTokenPayload, {
        expiresIn: '7d',
        secret: env.REFRESH_TOKEN_SECRET,
      }),
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
    };
  }

  async refreshAccessToken(
    payload: JwtPayload,
  ): Promise<RefreshTokenResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    const accessTokenExpiresIn = new Date(
      new Date().getTime() + 4 * 60 * 60 * 1000,
    ); // 4 hours

    const refreshTokenExpiresIn = new Date(
      new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
    ); // 7 days

    const accessTokenPayload = {
      sub: user.id,
      email: user.email,
      expiresIn: accessTokenExpiresIn,
    };

    const refreshTokenPayload = {
      sub: user.id,
      expiresIn: refreshTokenExpiresIn,
    };

    return {
      accessToken: await this.jwtService.signAsync(accessTokenPayload, {
        expiresIn: '4h',
        secret: env.ACCESS_TOKEN_SECRET,
      }),
      refreshToken: await this.jwtService.signAsync(refreshTokenPayload, {
        expiresIn: '7d',
        secret: env.REFRESH_TOKEN_SECRET,
      }),
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
    };
  }
}
