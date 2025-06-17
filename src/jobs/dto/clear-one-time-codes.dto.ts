import { OneTimeCode } from 'src/one-time-code/entity/one-time-code.entity';

export class ClearOneTimeCodesDto {
  expiredOneTimeCodes: OneTimeCode[];
}
