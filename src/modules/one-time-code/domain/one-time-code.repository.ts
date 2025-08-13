import { FindOneTimeCodeDto } from '../application/dto/find-one-time-code.dto';
import { OneTimeCodeEntity } from './entities/one-time-code.entity';

export abstract class OneTimeCodeRepository {
  abstract create(
    oneTimeCodeEntity: OneTimeCodeEntity,
  ): Promise<OneTimeCodeEntity>;

  abstract findByIdentifier(
    findOneTimeCodeDto: FindOneTimeCodeDto,
  ): Promise<OneTimeCodeEntity | null>;

  abstract upsert(
    oneTimeCodeEntity: OneTimeCodeEntity,
  ): Promise<OneTimeCodeEntity>;

  abstract delete(id: string): Promise<void>;
}
