import { IsEmail, IsString, IsUUID } from 'class-validator';

export class CreateStripeCustomerDto {
  @IsUUID()
  userId?: string;

  @IsEmail()
  email: string;

  @IsString()
  name?: string;
}
