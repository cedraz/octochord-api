import { PartialType } from '@nestjs/swagger';
import { CreateApiHealthCheckDto } from './create-api-health-check.dto';

export class UpdateApiHealthCheckDto extends PartialType(
  CreateApiHealthCheckDto,
) {}
