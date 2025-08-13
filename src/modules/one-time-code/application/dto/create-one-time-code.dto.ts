import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsObject, IsOptional } from 'class-validator';
import { VerificationType } from 'src/common/enums/verification-type.enum';

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
