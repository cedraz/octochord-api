import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
} from 'class-validator';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';

export class CreateEmailIntegrationDto {
  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[];
}

export class CreateIntegrationDto {
  @IsString()
  name: string;

  @IsString()
  githubWebhookSecret: string;

  @IsArray()
  @IsUrl({}, { each: true })
  discordWebhookURLs: string[];

  @IsString()
  @Matches(/^[0-9]+$/, {
    message: ErrorMessagesHelper.regexValidationError(
      'hookId',
      'Hook ID deve conter apenas números.',
    ),
  })
  hookId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => CreateEmailIntegrationDto)
  createEmailIntegrationDto?: CreateEmailIntegrationDto;
}
