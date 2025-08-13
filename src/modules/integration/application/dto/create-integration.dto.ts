import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsUrl, Matches } from 'class-validator';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';
import { CreateEmailIntegrationDto } from './create-email-integration.dto';

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
