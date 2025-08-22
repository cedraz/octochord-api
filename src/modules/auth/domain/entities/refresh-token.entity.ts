export class RefreshTokenEntity {
  id: string;
  hashedToken: string;
  expiresAt: Date;
  isActive: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;

  constructor(props: Partial<RefreshTokenEntity>) {
    Object.assign(this, props);
  }
}
