import { ApiProperty } from '@nestjs/swagger';
import { APIStatus } from 'src/shared/domain/enums/api-status.enum';
import { HttpMethods } from 'src/shared/domain/enums/http-methods.enum';
import { EmailNotificationEntity } from './email-notification.entity';
import { Type } from 'class-transformer';

export class ApiHealthCheckEntity {
  id: string;
  url: string;
  lastCheckedAt: Date;
  interval: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;

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

  @Type(() => EmailNotificationEntity)
  emailNotification?: EmailNotificationEntity;

  constructor(partial: Partial<ApiHealthCheckEntity>) {
    Object.assign(this, partial);
  }
}
