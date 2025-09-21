import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
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
  GOOGLE_CLIENT_ID: string;

  @IsString()
  GOOGLE_CLIENT_SECRET: string;

  @IsUrl({
    require_tld: false,
  })
  GOOGLE_CALLBACK_URL: string;

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
  MINIO_BUCKET_NAME: string;

  @IsString()
  MINIO_SECRET_ACCESS_KEY: string;

  @IsString()
  MINIO_ACCESS_KEY_ID: string;

  @IsString()
  MINIO_REGION: string;

  @IsString()
  MINIO_ENDPOINT: string;
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
