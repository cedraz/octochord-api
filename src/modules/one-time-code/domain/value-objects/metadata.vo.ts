import { Prisma } from '@prisma/client';

export class MetadataVO {
  constructor(private readonly value: Record<string, unknown> | null) {}

  toValue(): Record<string, unknown> | null {
    return this.value;
  }

  toPrismaValue(): Prisma.JsonValue {
    return this.value as Prisma.JsonValue;
  }

  static fromPrismaValue(value: Prisma.JsonValue | null): MetadataVO | null {
    if (value === null) return null;
    return new MetadataVO(value as Record<string, unknown>);
  }
}
