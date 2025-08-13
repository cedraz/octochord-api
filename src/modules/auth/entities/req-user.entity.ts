import { JwtPayload } from 'src/common/types/jwt-payload.interface';

export class ReqUser implements JwtPayload {
  sub: string;
  exp: number;
  iat: number;
  expiresIn: Date;
}
