import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { RefreshTokenRepository } from '../../domain/refresh-token.repository';
import { RefreshTokenEntity } from '../../domain/entities/refresh-token.entity';
import { CreateRefreshTokenDto } from '../../application/dto/create-refresh-token.dto';

@Injectable()
export class RefreshTokenPrismaRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  create({
    expiresAt,
    hashedToken,
    jti,
    userId,
  }: CreateRefreshTokenDto): Promise<RefreshTokenEntity> {
    return this.prisma.refreshToken.create({
      data: {
        id: jti,
        hashedToken,
        user: { connect: { id: userId } },
        expiresAt,
        isActive: true,
      },
    });
  }

  findByJti(jti: string): Promise<RefreshTokenEntity | null> {
    return this.prisma.refreshToken.findUnique({
      where: { hashedToken: jti },
    });
  }

  findAll(userId: string): Promise<RefreshTokenEntity[]> {
    return this.prisma.refreshToken.findMany({
      where: { userId, isActive: true },
    });
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
