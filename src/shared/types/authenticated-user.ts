import { VerificationType } from '../domain/enums/verification-type.enum';

export type TAuthenticatedUser = {
  sub: string;
  otcType?: VerificationType;
};
