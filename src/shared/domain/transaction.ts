export abstract class Transaction {
  abstract commit(): Promise<void>;
  abstract rollback(): Promise<void>;
  abstract getTransactionId(): string;
  abstract get client(): unknown;
}
