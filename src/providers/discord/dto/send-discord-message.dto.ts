import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class SendDiscordMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsUrl()
  discordWebhookURL: string;
}
