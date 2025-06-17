import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserStripeInfoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stripeCustomerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stripeSubscriptionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stripePriceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stripeSubscriptionStatus?: string;
}
