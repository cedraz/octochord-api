import { Injectable } from '@nestjs/common';
import { UnitOfWork } from '../domain/unit-of-work';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Transaction } from '../domain/transaction';
import { PrismaTransaction } from './prisma.transaction';

@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
  constructor(private readonly prisma: PrismaService) {}

  async execute<T>(work: (transaction: Transaction) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (txClient) => {
      const transaction = new PrismaTransaction(txClient);

      const result = await work(transaction);

      return result;
    });
  }
}
