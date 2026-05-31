import { Prisma } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/shared/application/dto/pagination-query.dto';

enum LogSortFieldEnum {
  CheckedAt = 'checkedAt',
}

export class ApiHealthCheckLogPaginationDto extends PaginationQueryDto<LogSortFieldEnum> {
  @IsEnum(LogSortFieldEnum)
  @IsOptional()
  sort: LogSortFieldEnum = LogSortFieldEnum.CheckedAt;

  where(apiHealthCheckId: string): Prisma.ApiHealthCheckLogWhereInput {
    return { apiHealthCheckId };
  }
}
