export class EmailIntegrationEntity {
  id: number;
  emails: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  integrationId: string;

  constructor(partial: Partial<EmailIntegrationEntity>) {
    Object.assign(this, partial);
  }
}
