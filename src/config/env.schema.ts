import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  CLOUDINARY_URL: string;

  @IsEmail()
  GOOGLE_CLIENT_EMAIL: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_PRIVATE_KEY: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_PROJECT_ID: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_SPREADSHEET_ID: string;

  @IsString()
  @IsNotEmpty()
  PORT: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  ACCESS_TOKEN_SECRET: string;

  @IsString()
  @IsNotEmpty()
  REFRESH_TOKEN_SECRET: string;

  @IsString()
  MAIL_HOST: string;

  @IsNumber()
  MAIL_PORT: number;

  @IsString()
  MAIL_USER: string;

  @IsString()
  MAIL_PASS: string;

  @IsBoolean()
  MAIL_SECURE: boolean;

  @IsString()
  @IsNotEmpty()
  REDIS_URL: string;

  @IsString()
  STRIPE_API_KEY: string;

  @IsString()
  STRIPE_FREE_PRICE_ID: string;

  @IsString()
  STRIPE_PREMIUM_PRICE_ID: string;

  @IsString()
  STRIPE_WEBHOOK_SECRET: string;
}
