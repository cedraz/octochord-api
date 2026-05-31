import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService extends ConsoleLogger {
  log(message: string, context?: string, object?: object) {
    super.log(message, context);
    if (object) {
      super.log(object);
    }
  }
}
