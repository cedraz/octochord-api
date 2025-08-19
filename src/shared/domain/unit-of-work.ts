import { Transaction } from './transaction';

export abstract class UnitOfWork {
  abstract execute<T>(
    work: (transaction: Transaction) => Promise<T>,
  ): Promise<T>;
}
