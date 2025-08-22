import { CreateRefreshTokenDto } from '../application/dto/create-refresh-token.dto';
import { RefreshTokenEntity } from './entities/refresh-token.entity';

export abstract class RefreshTokenRepository {
  abstract create(
    createRefreshTokenDto: CreateRefreshTokenDto,
  ): Promise<RefreshTokenEntity>;

  abstract findByJti(jti: string): Promise<RefreshTokenEntity | null>;

  abstract deleteMany(userId: string, userAgent?: string): Promise<void>;

  abstract findAll(userId: string): Promise<RefreshTokenEntity[]>;
}
