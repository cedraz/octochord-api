import { PaginationResultDto } from 'src/shared/domain/entities/pagination-result.entity';
import { ApiHealthCheckEntity } from './entities/api-health-check.entity';
import { ApiHealthCheckLogEntity } from './entities/api-health-check-log.entity';
import { ApiHealthCheckPaginationDto } from '../application/dto/api-health-check.pagination.dto';
import { ApiHealthCheckLogPaginationDto } from '../application/dto/api-health-check-log.pagination.dto';
import { UpdateApiHealthCheckDto } from '../application/dto/update-api-health-check.dto';
import { EmailNotificationEntity } from './entities/email-notification.entity';
import { Transaction } from 'src/shared/domain/transaction';
import { ApiHealthCheckStatsResponseDto } from '../application/dto/api-health-check-stats-response.dto';
import {
  ApiHealthCheckChartResponseDto,
  ChartRange,
} from '../application/dto/api-health-check-chart.dto';

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

  abstract getStats(id: string): Promise<ApiHealthCheckStatsResponseDto>;

  abstract getChart(
    id: string,
    range: ChartRange,
  ): Promise<ApiHealthCheckChartResponseDto>;

  abstract getLogs(
    id: string,
    dto: ApiHealthCheckLogPaginationDto,
  ): Promise<PaginationResultDto<ApiHealthCheckLogEntity>>;

  abstract exportLogsCsv(id: string): Promise<string>;
}
