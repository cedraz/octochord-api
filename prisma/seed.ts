import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.time('Seed completed successfully! 🌿');

  const users = [
    {
      name: 'User One',
      email: 'user1@example.com',
      password: 'user@123',
    },
    {
      name: 'User Two',
      email: 'user2@example.com',
      password: 'user@123',
    },
  ];

  for (const user of users) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(user.password, salt);

    console.log(passwordHash);

    // await prisma.user.create({
    //   data: {
    //     name: user.name,
    //     email: user.email,
    //     passwordHash,
    //     emailVerifiedAt: new Date(),
    //     phone: '71999999999',
    //   },
    // });
  }
}

main()
  .catch((e) => {
    console.error(e);
    console.timeEnd('Error seeding the database!');
    process.exit(1);
  })
  .finally(() => {
    (async () => {
      console.timeEnd('Seed completed successfully! 🌿');
      await prisma.$disconnect();
    })();
  });
