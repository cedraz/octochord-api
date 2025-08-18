import { OneTimeCodeEntity } from '../domain/entities/one-time-code.entity';
import { CreateOneTimeCodeDto } from './dto/create-one-time-code.dto';
import { FindOneTimeCodeDto } from './dto/find-one-time-code.dto';
import { ValidateResponseDto } from './dto/validate-response.dto';

export abstract class OneTimeCodeServiceAPI {
  abstract createOneTimeCode(params: {
    createOneTimeCodeDto: CreateOneTimeCodeDto;
    codeDigits?: string;
    expiresIn?: Date;
  }): Promise<Omit<OneTimeCodeEntity, 'code'>>;

  abstract validateOneTimeCode(
    validateOneTimeCodeDto: FindOneTimeCodeDto,
  ): Promise<ValidateResponseDto>;

  abstract findByIdentifier(
    findOneTimeCodeDto: FindOneTimeCodeDto,
  ): Promise<OneTimeCodeEntity | null>;

  abstract isOneTimeCodeExpired(oneTimeCodeEntity: OneTimeCodeEntity): boolean;

  abstract getOneTimeCodeExpirationTime(): Date;

  abstract delete(id: string): Promise<void>;
}
