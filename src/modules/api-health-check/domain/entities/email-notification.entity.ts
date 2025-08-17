export class EmailNotificationEntity {
  id: number;
  emails: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  apiHealthCheckId: string;

  constructor(partial: Partial<EmailNotificationEntity>) {
    Object.assign(this, partial);
  }
}
