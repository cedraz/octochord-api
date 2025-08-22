export class EmailNotificationEntity {
  id: number;
  emails: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  apiHealthCheckId: string;

  constructor(partial: Partial<EmailNotificationEntity>) {
    Object.assign(this, partial);
  }
}
