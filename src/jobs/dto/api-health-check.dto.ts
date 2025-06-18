import { HttpMethods } from '@prisma/client';

export class ApiHealthCheckDto {
  id: string;
  url: string;
  interval: number;
  method: HttpMethods;
}
