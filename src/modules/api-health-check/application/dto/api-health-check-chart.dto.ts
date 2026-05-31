import { IsEnum, IsOptional } from 'class-validator';

export enum ChartRange {
  ONE_HOUR = '1h',
  SIX_HOURS = '6h',
  TWENTY_FOUR_HOURS = '24h',
  SEVEN_DAYS = '7d',
}

export class ApiHealthCheckChartQueryDto {
  @IsEnum(ChartRange)
  @IsOptional()
  range: ChartRange = ChartRange.TWENTY_FOUR_HOURS;
}

export class ChartPointDto {
  checkedAt: Date;
  responseTime: number;
}

export class ApiHealthCheckChartResponseDto {
  range: ChartRange;
  points: ChartPointDto[];
}
