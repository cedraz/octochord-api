import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SendEmailQueueService } from 'src/jobs/queues/send-email-queue.service';
import { CreateOneTimeCodeDto } from './dto/create-one-time-code.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { VerificationType } from '@prisma/client';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { ValidateOneTimeCodeDto } from './dto/validate-one-time-code.dto';
import { env } from 'src/config/env-validation';
import { VerifyUserAccountDto } from './dto/verify-user-account.dto';
import {
  OneTimeCode,
  OneTimeCodeWithoutCode,
} from './entity/one-time-code.entity';

interface OneTimeCodeMetadata {
  userId: string;
}

@Injectable()
export class OneTimeCodeService {
  constructor(
    private jwtService: JwtService,
    private sendEmailQueueService: SendEmailQueueService,
    private prismaService: PrismaService,
  ) {}

  getOneTimeCodeExpirationTime() {
    return new Date(new Date().getTime() + 5 * 60 * 1000); // 5 minutes
  }

  isOneTimeCodeExpired(oneTimeCode: OneTimeCode) {
    return new Date() > oneTimeCode.expiresAt;
  }

  findByIdentifier(identifier: string) {
    return this.prismaService.oneTimeCode.findUnique({
      where: {
        identifier,
      },
    });
  }

  async createOneTimeCode({
    createOneTimeCodeDto,
    codeDigits,
    expiresIn,
  }: {
    createOneTimeCodeDto: CreateOneTimeCodeDto;
    codeDigits?: string;
    expiresIn?: Date;
  }): Promise<OneTimeCodeWithoutCode> {
    const code = codeDigits
      ? codeDigits
      : Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = expiresIn
      ? expiresIn
      : this.getOneTimeCodeExpirationTime(); // 5 minutes

    const oneTimeCode = await this.prismaService.oneTimeCode.upsert({
      where: { identifier: createOneTimeCodeDto.identifier },
      update: {
        code,
        expiresAt,
        type: createOneTimeCodeDto.type,
      },
      create: {
        identifier: createOneTimeCodeDto.identifier,
        code,
        type: createOneTimeCodeDto.type,
        expiresAt,
      },
    });

    await this.sendEmailQueueService.execute({
      to: createOneTimeCodeDto.identifier,
      subject: `Your email verification code is ${code}`,
      message: `Copy and paste this code to verify your email: ${code}`,
    });

    const { code: _code, ...rest } = oneTimeCode;

    return {
      ...rest,
    };
  }

  async validateChangeEmailRequest(
    validateOneTimeCodeDto: ValidateOneTimeCodeDto,
  ) {
    const oneTimeCode = await this.prismaService.oneTimeCode.findFirst({
      where: {
        identifier: validateOneTimeCodeDto.identifier,
        code: validateOneTimeCodeDto.code,
        type: validateOneTimeCodeDto.type,
      },
    });

    if (!oneTimeCode || this.isOneTimeCodeExpired(oneTimeCode)) {
      throw new ConflictException(
        ErrorMessagesHelper.INVALID_VERIFICATION_REQUEST,
      );
    }

    const metadata = oneTimeCode.metadata as unknown as OneTimeCodeMetadata;

    const userWithSameEmail = await this.prismaService.user.findUnique({
      where: {
        email: validateOneTimeCodeDto.identifier,
      },
    });

    if (userWithSameEmail) {
      throw new ConflictException(ErrorMessagesHelper.USER_ALREADY_EXISTS);
    }

    if (!metadata || !metadata.userId) {
      throw new ConflictException(ErrorMessagesHelper.INVALID_METADATA);
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        email: metadata.userId,
      },
    });

    if (!user) {
      throw new ConflictException(ErrorMessagesHelper.USER_NOT_FOUND);
    }

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: validateOneTimeCodeDto.identifier,
        emailVerifiedAt: new Date(),
      },
    });

    const accessTokenPayload = {
      sub: user.id,
      expiresIn: new Date(new Date().getTime() + 4 * 60 * 60 * 1000), // 4 hours
    };

    const refreshTokenPayload = {
      sub: user.id,
      expiresIn: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    await this.prismaService.oneTimeCode.delete({
      where: {
        id: oneTimeCode.id,
      },
    });

    return {
      message: 'Email alterado com sucesso!',
      accessToken: await this.jwtService.signAsync(accessTokenPayload, {
        expiresIn: '4h',
        secret: env.ACCESS_TOKEN_SECRET,
      }),
      refresh_token: await this.jwtService.signAsync(refreshTokenPayload, {
        expiresIn: '7d',
        secret: env.REFRESH_TOKEN_SECRET,
      }),
    };
  }

  async validateOneTimeCode(validateOneTimeCodeDto: ValidateOneTimeCodeDto) {
    const oneTimeCode = await this.prismaService.oneTimeCode.findFirst({
      where: {
        identifier: validateOneTimeCodeDto.identifier,
        code: validateOneTimeCodeDto.code,
        type: validateOneTimeCodeDto.type,
      },
    });

    if (!oneTimeCode || this.isOneTimeCodeExpired(oneTimeCode)) {
      throw new ConflictException(
        ErrorMessagesHelper.INVALID_VERIFICATION_REQUEST,
      );
    }

    const tokenPayload = {
      sub: '',
      email: validateOneTimeCodeDto.identifier,
      type: validateOneTimeCodeDto.type,
      expiresIn: new Date(new Date().getTime() + 5 * 60 * 1000), // 5 minutes
    };

    return {
      token: await this.jwtService.signAsync(tokenPayload, {
        expiresIn: '5m',
        secret: env.ACCESS_TOKEN_SECRET,
      }),
    };
  }

  async verifyUserAccount(verifyUserAccountDto: VerifyUserAccountDto) {
    const oneTimeCode = await this.prismaService.oneTimeCode.findUnique({
      where: {
        identifier: verifyUserAccountDto.identifier,
        code: verifyUserAccountDto.code,
        type: VerificationType.EMAIL_VERIFICATION,
      },
    });

    if (!oneTimeCode || this.isOneTimeCodeExpired(oneTimeCode)) {
      throw new ConflictException(
        ErrorMessagesHelper.INVALID_VERIFICATION_REQUEST,
      );
    }

    await this.prismaService.user.update({
      where: {
        email: verifyUserAccountDto.identifier,
      },
      data: {
        emailVerifiedAt: new Date(),
      },
    });

    return true;
  }
}
