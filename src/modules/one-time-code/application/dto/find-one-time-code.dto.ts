import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VerificationType } from 'src/common/enums/verification-type.enum';

export class FindOneTimeCodeDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(VerificationType)
  type?: VerificationType;
}
