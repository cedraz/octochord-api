import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OneTimeCodeRepository } from '../domain/one-time-code.repository';
import { OneTimeCodeEntity } from '../domain/entities/one-time-code.entity';
import { OneTimeCodeServiceAPI } from './one-time-code.service.interface';
import { SendEmailQueueService } from 'src/providers/nodemailer/queue/send-email-queue.service';
import { CreateOneTimeCodeDto } from './dto/create-one-time-code.dto';
import { FindOneTimeCodeDto } from './dto/find-one-time-code.dto';
import { ValidateOneTimeCodeDto } from '../../../shared/application/dto/validate-one-time-code.dto';
import { env } from 'process';
import { ErrorMessagesHelper } from 'src/shared/helpers/error-messages.helper';
import { ValidateResponseDto } from './dto/validate-response.dto';

@Injectable()
export class OneTimeCodeService implements OneTimeCodeServiceAPI {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sendEmailQueueService: SendEmailQueueService,
    private readonly oneTimeCodeRepository: OneTimeCodeRepository,
  ) {}

  getOneTimeCodeExpirationTime() {
    return new Date(new Date().getTime() + 15 * 60 * 1000); // 15 minutes
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
    expirationDate,
  }: {
    createOneTimeCodeDto: CreateOneTimeCodeDto;
    codeDigits?: string;
    expirationDate?: Date;
  }) {
    const code = codeDigits
      ? codeDigits
      : Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = expirationDate
      ? expirationDate
      : this.getOneTimeCodeExpirationTime(); // 15 minutes

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

  async validateOneTimeCode(
    validateOneTimeCodeDto: ValidateOneTimeCodeDto,
  ): Promise<ValidateResponseDto> {
    const oneTimeCode = await this.oneTimeCodeRepository.findByIdentifier({
      identifier: validateOneTimeCodeDto.identifier,
      code: validateOneTimeCodeDto.code,
      type: validateOneTimeCodeDto.type,
    });

    if (!oneTimeCode || this.isOneTimeCodeExpired(oneTimeCode)) {
      throw new ConflictException(
        ErrorMessagesHelper.INVALID_VERIFICATION_REQUEST,
      );
    }

    const tokenPayload = {
      sub: '',
      otcType: validateOneTimeCodeDto.type,
    };

    return {
      token: await this.jwtService.signAsync(tokenPayload, {
        expiresIn: '5m',
        secret: env.ACCESS_TOKEN_SECRET,
      }),
    };
  }

  async delete(id: string): Promise<void> {
    const otc = await this.oneTimeCodeRepository.findById(id);

    if (!otc) {
      throw new ConflictException(ErrorMessagesHelper.OTC_NOT_FOUND);
    }

    return this.oneTimeCodeRepository.delete(id);
  }
}
