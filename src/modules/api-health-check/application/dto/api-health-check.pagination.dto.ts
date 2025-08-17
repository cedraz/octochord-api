import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from 'src/shared/dto/pagination-query.dto';

enum ApiHealthCheckSortFieldEnum {
  CreatedAt = 'createdAt',
}

export class ApiHealthCheckPaginationDto extends PaginationQueryDto<ApiHealthCheckSortFieldEnum> {
  @ApiPropertyOptional({
    enum: ApiHealthCheckSortFieldEnum,
    default: ApiHealthCheckSortFieldEnum.CreatedAt,
  })
  @IsEnum(ApiHealthCheckSortFieldEnum)
  @IsOptional()
  sort: ApiHealthCheckSortFieldEnum = ApiHealthCheckSortFieldEnum.CreatedAt;

  where(): Prisma.ApiHealthCheckWhereInput {
    const AND: Prisma.Enumerable<Prisma.ApiHealthCheckWhereInput> = [];

    if (this.q) {
      AND.push({
        OR: [{ url: { contains: this.q, mode: 'insensitive' } }],
      });
    }

    return {
      AND,
    };
  }
}
