import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OneTimeCodeRepository } from '../domain/one-time-code.repository';
import { OneTimeCodeEntity } from '../domain/entities/one-time-code.entity';
import { OneTimeCodeServiceAPI } from './one-time-code.service.interface';
import { SendEmailQueueService } from 'src/providers/mailer/queue/send-email-queue.service';
import { CreateOneTimeCodeDto } from './dto/create-one-time-code.dto';
import { FindOneTimeCodeDto } from './dto/find-one-time-code.dto';

@Injectable()
export class OneTimeCodeService implements OneTimeCodeServiceAPI {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sendEmailQueueService: SendEmailQueueService,
    private readonly oneTimeCodeRepository: OneTimeCodeRepository,
  ) {}

  getOneTimeCodeExpirationTime() {
    return new Date(new Date().getTime() + 5 * 60 * 1000); // 5 minutes
  }

  isOneTimeCodeExpired(oneTimeCodeEntity: OneTimeCodeEntity): boolean {
    return new Date() > oneTimeCodeEntity.expiresAt;
  }

  findByIdentifier(
    FindOneTimeCodeDto: FindOneTimeCodeDto,
  ): Promise<OneTimeCodeEntity | null> {
    return this.oneTimeCodeRepository.findByIdentifier({
      identifier: FindOneTimeCodeDto.identifier,
      code: FindOneTimeCodeDto.code,
      type: FindOneTimeCodeDto.type,
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
  }) {
    const code = codeDigits
      ? codeDigits
      : Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = expiresIn
      ? expiresIn
      : this.getOneTimeCodeExpirationTime(); // 5 minutes

    const otc = new OneTimeCodeEntity({
      identifier: createOneTimeCodeDto.identifier,
      code,
      expiresAt,
      type: createOneTimeCodeDto.type,
    });

    const oneTimeCode = await this.oneTimeCodeRepository.upsert(otc);

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

  // async validateChangeEmailRequest(
  //   validateOneTimeCodeDto: ValidateOneTimeCodeDto,
  // ) {
  //   const oneTimeCode = await this.oneTimeCodeRepository.findByIdentifier({
  //     identifier: validateOneTimeCodeDto.identifier,
  //     code: validateOneTimeCodeDto.code,
  //     type: VerificationType.EMAIL_VERIFICATION,
  //   });

  //   if (!oneTimeCode || this.isOneTimeCodeExpired(oneTimeCode)) {
  //     throw new ConflictException(
  //       ErrorMessagesHelper.INVALID_VERIFICATION_REQUEST,
  //     );
  //   }

  //   const metadata = oneTimeCode.metadata as unknown as OneTimeCodeMetadata;

  //   const userWithSameEmail = await this.userService.findByEmail(
  //     validateOneTimeCodeDto.identifier,
  //   );

  //   if (userWithSameEmail) {
  //     throw new ConflictException(ErrorMessagesHelper.USER_ALREADY_EXISTS);
  //   }

  //   if (!metadata || !metadata.userId) {
  //     throw new ConflictException(ErrorMessagesHelper.INVALID_METADATA);
  //   }

  //   const user = await this.userService.findById(metadata.userId);

  //   if (!user) {
  //     throw new ConflictException(ErrorMessagesHelper.USER_NOT_FOUND);
  //   }

  //   await this.userService.update(user.id, {
  //     email: validateOneTimeCodeDto.identifier,
  //     emailVerifiedAt: new Date(),
  //   });

  //   const accessTokenPayload = {
  //     sub: user.id,
  //     expiresIn: new Date(new Date().getTime() + 4 * 60 * 60 * 1000), // 4 hours
  //   };

  //   const refreshTokenPayload = {
  //     sub: user.id,
  //     expiresIn: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
  //   };

  //   await this.oneTimeCodeRepository.delete(oneTimeCode.id);

  //   return {
  //     message: 'Email alterado com sucesso!',
  //     accessToken: await this.jwtService.signAsync(accessTokenPayload, {
  //       expiresIn: '4h',
  //       secret: env.JWT_SECRET,
  //     }),
  //     refresh_token: await this.jwtService.signAsync(refreshTokenPayload, {
  //       expiresIn: '7d',
  //       secret: env.JWT_SECRET,
  //     }),
  //   };
  // }

  // async validateOneTimeCode(validateOneTimeCodeDto: ValidateOneTimeCodeDto) {
  //   const oneTimeCode = await this.oneTimeCodeRepository.findByIdentifier({
  //     identifier: validateOneTimeCodeDto.identifier,
  //     code: validateOneTimeCodeDto.code,
  //     type: validateOneTimeCodeDto.type,
  //   });

  //   if (!oneTimeCode || this.isOneTimeCodeExpired(oneTimeCode)) {
  //     throw new ConflictException(
  //       ErrorMessagesHelper.INVALID_VERIFICATION_REQUEST,
  //     );
  //   }

  //   const tokenPayload = {
  //     sub: '',
  //     email: validateOneTimeCodeDto.identifier,
  //     type: validateOneTimeCodeDto.type,
  //     expiresIn: new Date(new Date().getTime() + 5 * 60 * 1000), // 5 minutes
  //   };

  //   return {
  //     token: await this.jwtService.signAsync(tokenPayload, {
  //       expiresIn: '5m',
  //       secret: env.JWT_SECRET,
  //     }),
  //   };
  // }

  // async verifyUserAccount(verifyUserAccountDto: VerifyUserAccountDto) {
  //   const oneTimeCode = await this.oneTimeCodeRepository.findByIdentifier({
  //     identifier: verifyUserAccountDto.identifier,
  //     code: verifyUserAccountDto.code,
  //     type: VerificationType.EMAIL_VERIFICATION,
  //   });

  //   if (!oneTimeCode || this.isOneTimeCodeExpired(oneTimeCode)) {
  //     throw new ConflictException(
  //       ErrorMessagesHelper.INVALID_VERIFICATION_REQUEST,
  //     );
  //   }

  //   const user = await this.userService.findByEmail(
  //     verifyUserAccountDto.identifier,
  //   );

  //   await this.userService.update(user.id, {
  //     emailVerifiedAt: new Date(),
  //   });

  //   return true;
  // }
}
