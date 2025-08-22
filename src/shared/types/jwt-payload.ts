import { VerificationType } from '../domain/enums/verification-type.enum';

export type TAccessTokenPayload = {
  sub: string;
  otcType?: VerificationType;
  iat: number;
  exp: number;
  iss: string;
};

export type TRefreshTokenPayload = {
  jti: string;
  sub: string;
};
