import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { PaginationResultDto } from '../entities/pagination-result.entity';

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  class CustomPaginationResultDto<T> implements PaginationResultDto<T> {
    @IsArray()
    @ApiProperty({ type: 'array', items: { $ref: getSchemaPath(model) } })
    readonly results: T[];

    @ApiProperty()
    total: number;

    @ApiProperty({ default: 100 })
    limit: number;

    @ApiProperty({ default: 0 })
    init: number;
  }

  Object.defineProperty(CustomPaginationResultDto, 'name', {
    writable: false,
    value: `${model.name}PaginationDto`,
  });

  return applyDecorators(
    ApiExtraModels(model, CustomPaginationResultDto),
    ApiOkResponse({
      description: 'Successfully received model list',
      schema: {
        title: `PaginatedResponseOf${model.name}`,
        allOf: [
          { $ref: getSchemaPath(CustomPaginationResultDto) },
          {
            properties: {
              results: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};
