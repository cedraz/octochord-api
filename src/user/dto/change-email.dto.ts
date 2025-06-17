import { IsString, IsNotEmpty } from 'class-validator';

export class ChangeEmailDto {
  @IsString()
  @IsNotEmpty()
  newEmail: string;
}
