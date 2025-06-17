import { IsString } from 'class-validator';

export class CreateStripeSCheckoutSessionDto {
  @IsString()
  stripeCustomerId: string;

  @IsString()
  stripeSubscriptionId: string;
}
