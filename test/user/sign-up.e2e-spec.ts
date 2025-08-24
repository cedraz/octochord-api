import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { AppModule } from 'src/app.module';

describe('Sign Up (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/user (POST) Should create user', async () => {
    const usersBefore = await prisma.user.findMany();
    expect(usersBefore).toHaveLength(0);

    await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'somehash',
      },
    });

    const usersAfter = await prisma.user.findMany();
    console.log('Users after creation:', usersAfter);
    expect(usersAfter).toHaveLength(1);
    expect(usersAfter[0].email).toBe('test@example.com');
  });
});
