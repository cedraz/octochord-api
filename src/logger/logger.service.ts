import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class CustomLogger extends ConsoleLogger {
  log(message: string, context?: string, object?: object) {
    super.log(message, context);
    if (object) {
      super.log(object);
    }
  }
}
