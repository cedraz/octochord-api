import { Injectable } from '@nestjs/common';
import { OneTimeCodeRepository } from '../../domain/one-time-code.repository';
import { OneTimeCodeEntity } from '../../domain/entities/one-time-code.entity';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { FindOneTimeCodeDto } from '../../application/dto/find-one-time-code.dto';
import { VerificationType } from 'src/shared/domain/enums/verification-type.enum';
import { MetadataVO } from '../../domain/value-objects/metadata.vo';

@Injectable()
export class OneTimeCodePrismaRepository implements OneTimeCodeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    oneTimeCodeEntity: OneTimeCodeEntity,
  ): Promise<OneTimeCodeEntity> {
    const otc = await this.prisma.oneTimeCode.create({
      data: {
        identifier: oneTimeCodeEntity.identifier,
        code: oneTimeCodeEntity.code,
        expiresAt: oneTimeCodeEntity.expiresAt,
        type: oneTimeCodeEntity.type,
      },
    });

    return new OneTimeCodeEntity({
      ...otc,
      type: oneTimeCodeEntity.type,
      metadata: oneTimeCodeEntity.metadata,
    });
  }

  async findById(id: string): Promise<OneTimeCodeEntity | null> {
    const otc = await this.prisma.oneTimeCode.findUnique({
      where: { id },
    });

    if (!otc) return null;

    return new OneTimeCodeEntity({
      ...otc,
      type: otc.type as VerificationType,
      metadata: otc.metadata ? MetadataVO.fromPrismaValue(otc.metadata) : null,
    });
  }

  async findByIdentifier(
    findOneTimeCodeDto: FindOneTimeCodeDto,
  ): Promise<OneTimeCodeEntity | null> {
    const otc = await this.prisma.oneTimeCode.findUnique({
      where: {
        identifier: findOneTimeCodeDto.identifier,
        code: findOneTimeCodeDto.code,
        type: findOneTimeCodeDto.type,
      },
    });

    if (!otc) return null;

    return new OneTimeCodeEntity({
      ...otc,
      type: otc.type as VerificationType,
      metadata: otc.metadata ? MetadataVO.fromPrismaValue(otc.metadata) : null,
    });
  }

  async upsert(
    oneTimeCodeEntity: OneTimeCodeEntity,
  ): Promise<OneTimeCodeEntity> {
    const otc = await this.prisma.oneTimeCode.upsert({
      where: { identifier: oneTimeCodeEntity.identifier },
      update: {
        code: oneTimeCodeEntity.code,
        expiresAt: oneTimeCodeEntity.expiresAt,
        type: oneTimeCodeEntity.type,
      },
      create: {
        identifier: oneTimeCodeEntity.identifier,
        code: oneTimeCodeEntity.code,
        expiresAt: oneTimeCodeEntity.expiresAt,
        type: oneTimeCodeEntity.type,
      },
    });

    return new OneTimeCodeEntity({
      ...otc,
      type: otc.type as VerificationType,
      metadata: oneTimeCodeEntity.metadata,
    });
  }

  async delete(id: string) {
    await this.prisma.oneTimeCode.delete({
      where: { id },
    });
  }

  async deleteExpiredCodes(): Promise<number> {
    const now = new Date();
    const deletedOTCs = await this.prisma.oneTimeCode.deleteMany({
      where: { expiresAt: { lt: now } },
    });

    return deletedOTCs.count;
  }
}
