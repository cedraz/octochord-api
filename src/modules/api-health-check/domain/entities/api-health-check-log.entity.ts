import { APIStatus } from 'src/shared/domain/enums/api-status.enum';

export class ApiHealthCheckLogEntity {
  id: number;
  status: APIStatus;
  statusCode: number | null;
  errorMessage: string | null;
  responseTime: number;
  checkedAt: Date;
  apiHealthCheckId: string;

  constructor(partial: Partial<ApiHealthCheckLogEntity>) {
    Object.assign(this, partial);
  }
}
