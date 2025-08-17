import { OneTimeCodeEntity } from '../domain/entities/one-time-code.entity';
import { CreateOneTimeCodeDto } from './dto/create-one-time-code.dto';
import { FindOneTimeCodeDto } from './dto/find-one-time-code.dto';

export abstract class OneTimeCodeServiceAPI {
  abstract createOneTimeCode(params: {
    createOneTimeCodeDto: CreateOneTimeCodeDto;
    codeDigits?: string;
    expiresIn?: Date;
  }): Promise<Omit<OneTimeCodeEntity, 'code'>>;

  // abstract validateChangeEmailRequest(
  //   validateOneTimeCodeDto: ValidateOneTimeCodeDto,
  // ): Promise<{
  //   message: string;
  //   accessToken: string;
  //   refresh_token: string;
  // }>;

  // abstract validateOneTimeCode(
  //   validateOneTimeCodeDto: ValidateOneTimeCodeDto,
  // ): Promise<{ token: string }>;

  // abstract verifyUserAccount(
  //   verifyUserAccountDto: VerifyUserAccountDto,
  // ): Promise<boolean>;

  abstract findByIdentifier(
    findOneTimeCodeDto: FindOneTimeCodeDto,
  ): Promise<OneTimeCodeEntity | null>;

  abstract isOneTimeCodeExpired(oneTimeCodeEntity: OneTimeCodeEntity): boolean;

  abstract getOneTimeCodeExpirationTime(): Date;
}
