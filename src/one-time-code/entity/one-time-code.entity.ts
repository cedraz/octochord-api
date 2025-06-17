import { ApiProperty } from '@nestjs/swagger';
import { VerificationType } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';

export class OneTimeCode {
  id: string;
  code: string;
  identifier: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata: JsonValue | null;

  @ApiProperty({
    enumName: 'VerificationType',
    enum: VerificationType,
  })
  type: VerificationType;
}

export class OneTimeCodeWithoutCode {
  id: string;
  identifier: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata: JsonValue | null;

  @ApiProperty({
    enumName: 'VerificationType',
    enum: VerificationType,
  })
  type: VerificationType;
}
