import { Injectable, Type } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

function createExtendedPrismaClient() {
  return new PrismaClient();
  // .$extends(proposalExtension)
}

const ExtendedPrismaClient = class {
  constructor() {
    return createExtendedPrismaClient();
  }
} as Type<ReturnType<typeof createExtendedPrismaClient>>;

@Injectable()
export class PrismaService extends ExtendedPrismaClient {
  constructor() {
    super();
  }
}

export type ExtendedPrismaClient = ReturnType<
  typeof createExtendedPrismaClient
>;
export type PrismaTransactionClient = Omit<
  ExtendedPrismaClient,
  '$extends' | '$transaction' | '$disconnect' | '$connect' | '$on' | '$use'
>;
