import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rp = await prisma.rolePermission.findMany({
    where: { role: 'CLIENTE' },
    include: { permission: true },
  });
  console.log(JSON.stringify(rp, null, 2));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
