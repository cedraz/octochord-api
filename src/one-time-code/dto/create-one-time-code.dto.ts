import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationType } from '@prisma/client';
import { IsEmail, IsEnum, IsObject, IsOptional } from 'class-validator';

export class CreateOneTimeCodeDto {
  @IsEmail()
  identifier: string;

  @IsEnum(VerificationType)
  @ApiProperty({ enum: VerificationType, enumName: 'VerificationType' })
  type: VerificationType;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'Additional data to be stored with the verification request, user only in a few cases',
  })
  metadata?: Record<string, any>;
}
