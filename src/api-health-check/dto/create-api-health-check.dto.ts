import { ApiProperty } from '@nestjs/swagger';
import { HttpMethods } from '@prisma/client';
import { IsEnum, IsInt, IsUrl, Max, Min } from 'class-validator';

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
}
