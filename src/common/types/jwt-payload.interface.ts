import { VerificationType } from '@prisma/client';

export type JwtPayload = {
  sub: string;
  expiresIn: Date;
  iat: number;
  exp: number;
  type?: VerificationType;
  email?: string;
};
