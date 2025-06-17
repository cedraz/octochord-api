import { IsString } from 'class-validator';

export class FindUserByStripeInfoDto {
  @IsString()
  stripeCustomerId: string;

  @IsString()
  stripeSubscriptionId: string;
}
