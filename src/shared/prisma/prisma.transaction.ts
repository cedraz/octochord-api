import { nanoid } from 'nanoid';
import { Transaction } from '../domain/transaction';
import { PrismaClient } from '@prisma/client';

type TransactionalPrismaClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export class PrismaTransaction implements Transaction {
  public readonly id: string;

  constructor(public readonly client: TransactionalPrismaClient) {
    this.id = nanoid();
  }

  getTransactionId(): string {
    return this.id;
  }

  async commit(): Promise<void> {
    return Promise.resolve();
  }

  async rollback(): Promise<void> {
    return Promise.resolve();
  }
}
