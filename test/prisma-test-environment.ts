import NodeEnvironment from 'jest-environment-node';
import type { JestEnvironmentConfig } from '@jest/environment';
import { v4 as uuid } from 'uuid';
import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class PrismaTestEnvironment extends NodeEnvironment {
  private schema: string;
  private connectionString: string;

  constructor(config: JestEnvironmentConfig, context: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super(config, context);
    this.connectionString = process.env.DATABASE_URL!;
    this.schema = uuid();
  }

  async setup() {
    await super.setup();

    const databaseUrl = `${this.connectionString}?schema=${this.schema}`;
    console.log(`databaseUrl: ${databaseUrl}`);

    process.env.DATABASE_URL = databaseUrl;
    process.env.DIRECT_DATABASE_URL = databaseUrl;
    this.global.process.env.DATABASE_URL = databaseUrl;

    console.log('Updated DATABASE_URL:', process.env.DATABASE_URL);

    execSync('npx prisma db push --skip-generate', {
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl,
        DIRECT_DATABASE_URL: databaseUrl,
      },
    });
  }

  async teardown() {
    console.log('Teardown PrismaTestEnvironment');
    await prisma.$executeRawUnsafe(
      `DROP SCHEMA IF EXISTS "${this.schema}" CASCADE;`,
    );
    await prisma.$disconnect();

    console.log('Disconnected Prisma client');
    await super.teardown();
  }
}

export default PrismaTestEnvironment;
