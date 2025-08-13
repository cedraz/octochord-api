import { OneTimeCodeEntity } from '../domain/entities/one-time-code.entity';
import { CreateOneTimeCodeDto } from './dto/create-one-time-code.dto';
import { ValidateOneTimeCodeDto } from './dto/validate-one-time-code.dto';
import { VerifyUserAccountDto } from './dto/verify-user-account.dto';

export abstract class OneTimeCodeServiceAPI {
  abstract createOneTimeCode(params: {
    createOneTimeCodeDto: CreateOneTimeCodeDto;
    codeDigits?: string;
    expiresIn?: Date;
  }): Promise<Omit<OneTimeCodeEntity, 'code'>>;

  abstract validateChangeEmailRequest(
    validateOneTimeCodeDto: ValidateOneTimeCodeDto,
  ): Promise<{
    message: string;
    accessToken: string;
    refresh_token: string;
  }>;

  abstract validateOneTimeCode(
    validateOneTimeCodeDto: ValidateOneTimeCodeDto,
  ): Promise<{ token: string }>;

  abstract verifyUserAccount(
    verifyUserAccountDto: VerifyUserAccountDto,
  ): Promise<boolean>;

  abstract findByIdentifier(
    identifier: string,
  ): Promise<OneTimeCodeEntity | null>;

  abstract isOneTimeCodeExpired(oneTimeCodeEntity: OneTimeCodeEntity): boolean;

  abstract getOneTimeCodeExpirationTime(): Date;
}
