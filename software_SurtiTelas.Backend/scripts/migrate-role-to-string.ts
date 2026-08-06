import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  try {
    await prisma.$executeRaw`
      ALTER TABLE role_configs
      ALTER COLUMN role TYPE VARCHAR(255)
      USING (role::text);
    `;
    console.log('role_configs.role changed to VARCHAR');

    await prisma.$executeRaw`
      ALTER TABLE role_permissions
      ALTER COLUMN role TYPE VARCHAR(255)
      USING (role::text);
    `;
    console.log('role_permissions.role changed to VARCHAR');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
