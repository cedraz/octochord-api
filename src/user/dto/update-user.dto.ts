import { ApiHideProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;

  @IsDate()
  @IsOptional()
  @ApiPropertyOptional()
  @ApiHideProperty()
  emailVerifiedAt?: Date;
}
