import { Module } from '@nestjs/common';
import { USER_SERVICE_TOKEN, OTC_SERVICE_TOKEN } from '../tokens/tokens';

@Module({
  providers: [
    { provide: USER_SERVICE_TOKEN, useValue: null },
    { provide: OTC_SERVICE_TOKEN, useValue: null },
  ],
  exports: [USER_SERVICE_TOKEN, OTC_SERVICE_TOKEN],
})
export class SharedModule {}
