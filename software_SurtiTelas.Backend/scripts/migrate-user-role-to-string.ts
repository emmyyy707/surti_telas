import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  try {
    await prisma.$executeRaw`
      ALTER TABLE users
      ALTER COLUMN role TYPE VARCHAR(255)
      USING (role::text);
    `;
    console.log('users.role changed to VARCHAR');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
