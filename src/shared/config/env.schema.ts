import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator';
import * as dotenv from 'dotenv';
import 'reflect-metadata'; // Necessário para o class-transformer e class-validator funcionarem corretamente

dotenv.config(); // Necessário para carregar as variáveis de ambiente do arquivo .env

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  CLOUDINARY_URL: string;

  @IsString()
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
  DIRECT_DATABASE_URL: string;

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
}

const validatedConfig = plainToInstance(EnvironmentVariables, process.env, {
  enableImplicitConversion: true, // Permite a conversão implícita de tipos, como string para number
});

const errors = validateSync(validatedConfig, {
  skipMissingProperties: false, // Não permite propriedades faltantes
});

if (errors.length > 0) {
  throw new Error(
    `Erro na validação das variáveis de ambiente: ${errors.toString()}`,
  );
}

export const env: EnvironmentVariables = validatedConfig;
