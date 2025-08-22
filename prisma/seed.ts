import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.time('Seed completed successfully! 🌿');
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
