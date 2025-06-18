import { IsArray, IsString, IsUrl, Matches } from 'class-validator';
import { ErrorMessagesHelper } from 'src/helpers/error-messages.helper';

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
}
