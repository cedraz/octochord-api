import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { HttpMethods } from 'src/shared/domain/enums/http-methods.enum';

export class CreateEmailNotificationDto {
  @IsArray()
  @IsEmail({}, { each: true })
  @Max(5, { message: 'No more than 5 email addresses are allowed' })
  emails: string[];
}

export class CreateApiHealthCheckDto {
  @IsUrl({ require_tld: false })
  url: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(300)
  @Max(1800)
  interval: number;

  @ApiProperty({
    enumName: 'HttpMethod',
    enum: HttpMethods,
  })
  @IsEnum(HttpMethods)
  method: HttpMethods;

  @ApiPropertyOptional({ default: 99.9, description: 'SLA target in %' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  slaTarget?: number = 99.9;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => CreateEmailNotificationDto)
  createEmailNotificationDto?: CreateEmailNotificationDto;
}
