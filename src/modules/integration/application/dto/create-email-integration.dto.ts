import { IsArray, IsEmail } from 'class-validator';

export class CreateEmailIntegrationDto {
  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[];
}
