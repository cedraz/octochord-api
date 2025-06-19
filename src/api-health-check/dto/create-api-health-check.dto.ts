import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HttpMethods } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class CreateEmailNotificationDto {
  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[];
}

export class CreateApiHealthCheckDto {
  @IsUrl()
  url: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => CreateEmailNotificationDto)
  createEmailNotificationDto?: CreateEmailNotificationDto;
}
