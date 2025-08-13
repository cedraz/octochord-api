import { IsString, IsEmail } from 'class-validator';

export class VerifyUserAccountDto {
  @IsEmail()
  identifier: string;

  @IsString()
  code: string;
}
