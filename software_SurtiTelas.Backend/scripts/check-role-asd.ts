import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const rows = await prisma.$queryRawUnsafe(`SELECT role, estado, descripcion FROM "role_configs" WHERE role = 'asd'`);
  console.log(JSON.stringify(rows, null, 2));
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
