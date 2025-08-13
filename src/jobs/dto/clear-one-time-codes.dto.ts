import { OneTimeCodeEntity } from 'src/modules/one-time-code/domain/entities/one-time-code.entity';

export class ClearOneTimeCodesDto {
  expiredOneTimeCodes: OneTimeCodeEntity[];
}
