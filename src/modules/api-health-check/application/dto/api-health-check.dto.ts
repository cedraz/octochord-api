import { HttpMethods } from 'src/shared/domain/enums/http-methods.enum';

export class ApiHealthCheckDto {
  id: string;
  url: string;
  interval: number;
  method: HttpMethods;
}
