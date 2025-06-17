import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { OrderEnum } from '../enum/order.enum';
import { PaginationResultDto } from '../entities/pagination-result.entity';

export abstract class PaginationQueryDto<T extends string = 'createdAt'> {
  abstract sort: T;

  @ApiProperty({
    default: 0,
    maxLength: 100,
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  init: number;

  @ApiProperty({
    default: 10,
    maximum: 100,
    minimum: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  limit: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  q: string;

  @ApiPropertyOptional({
    enum: OrderEnum,
    default: OrderEnum.ASC,
    enumName: 'Order',
  })
  @IsEnum(OrderEnum)
  @IsOptional()
  @Transform((v: { value: string }) => v.value.toLowerCase())
  readonly order: OrderEnum = OrderEnum.ASC;

  orderBy(): object {
    return {
      take: this.limit,
      skip: this.init,
      orderBy: {
        [this.sort]: this.order,
      },
    };
  }

  createMetadata<T>(results: T[], total: number): PaginationResultDto<T> {
    return {
      init: this.init,
      limit: this.limit,
      results,
      total,
    };
  }
}
