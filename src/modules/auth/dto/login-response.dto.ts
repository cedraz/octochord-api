import { UserResponseDto } from 'src/modules/user/application/dto/user-response.dto';

export class LoginResponseDto {
  userWithoutPassword: UserResponseDto;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: Date;
  refreshTokenExpiresIn: Date;
}
