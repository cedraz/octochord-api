import { PaginationResultDto } from 'src/shared/entities/pagination-result.entity';
import { ApiHealthCheckEntity } from './entities/api-health-check.entity';
import { ApiHealthCheckPaginationDto } from '../application/dto/api-health-check.pagination.dto';
import { UpdateApiHealthCheckDto } from '../application/dto/update-api-health-check.dto';
import { EmailNotificationEntity } from './entities/email-notification.entity';
import { Transaction } from 'src/shared/domain/transaction';

export abstract class ApiHealthCheckRepository {
  abstract create(
    apiHealthCheckEntity: ApiHealthCheckEntity,
    tx?: Transaction,
  ): Promise<ApiHealthCheckEntity>;

  abstract createEmailNotification(
    emailNotificationEntity: EmailNotificationEntity,
    tx?: Transaction,
  ): Promise<EmailNotificationEntity>;

  abstract findAll(
    userId: string,
    dto: ApiHealthCheckPaginationDto,
  ): Promise<PaginationResultDto<ApiHealthCheckEntity>>;

  abstract update(
    id: string,
    updateApiHealthCheckDto: UpdateApiHealthCheckDto,
  ): Promise<ApiHealthCheckEntity>;

  abstract remove(id: string): Promise<ApiHealthCheckEntity>;

  abstract findById(id: string): Promise<ApiHealthCheckEntity | null>;
}
