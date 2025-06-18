import { ApiProperty } from '@nestjs/swagger';
import { APIStatus, HttpMethods } from '@prisma/client';

export class ApiHealthCheck {
  id: string;
  url: string;
  lastCheckedAt: Date;
  interval: number;
  createdAt: Date;
  updatedAt: Date;

  @ApiProperty({
    enumName: 'HttpMethod',
    enum: HttpMethods,
  })
  method: HttpMethods;

  @ApiProperty({
    enumName: 'APIStatus',
    enum: APIStatus,
  })
  status: APIStatus;
}
