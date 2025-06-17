import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsInt, IsUUID } from 'class-validator';

export class CreateStripeMobileCheckoutDto {
  @IsUUID()
  userId: string;

  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Amount in cents',
  })
  @IsInt()
  amount: number;

  @IsEnum(['brl', 'usd'])
  currency: string;

  description: string;
}
