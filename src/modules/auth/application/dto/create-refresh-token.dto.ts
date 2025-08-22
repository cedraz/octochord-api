export class CreateRefreshTokenDto {
  jti: string;
  hashedToken: string;
  userId: string;
  expiresAt: Date;
  userAgent: string;
  ipAddress?: string;
}
