export interface IError {
  message: string;
  error: string;
  statusCode: number;
  details?: Record<string, unknown>;
}
