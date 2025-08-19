export type TAccessTokenPayload = {
  sub: string;
  expiresIn: Date;
  iat: number;
  exp: number;
  iss: string;
};

export type TRefreshTokenPayload = {
  jti: string;
  sub: string;
};
