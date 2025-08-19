import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UnitOfWork } from '../domain/unit-of-work';
import { PrismaUnitOfWork } from './prisma.unit-of-work';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: UnitOfWork,
      useClass: PrismaUnitOfWork,
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
