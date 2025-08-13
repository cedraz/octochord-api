import { IsDate, IsString } from 'class-validator';

export class CreateProviderDto {
  @IsString()
  provider_id: string;

  @IsString()
  provider_account_id: string;

  @IsString()
  accessToken?: string;

  @IsString()
  refresh_token?: string;

  @IsDate()
  accessToken_expires?: Date;
}
