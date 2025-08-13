import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum } from 'class-validator';
import { VerificationType } from 'src/common/enums/verification-type.enum';

export class ValidateOneTimeCodeDto {
  @IsEmail()
  identifier: string;

  @IsString()
  code: string;

  @IsEnum(VerificationType)
  @ApiProperty({ enum: VerificationType, enumName: 'VerificationType' })
  type: VerificationType;
}
