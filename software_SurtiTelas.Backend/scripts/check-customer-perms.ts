import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const perms = await prisma.permission.findMany({ where: { code: { contains: 'customers' } } });
  console.log('PERMISSIONS', JSON.stringify(perms, null, 2));

  const rp = await prisma.rolePermission.findMany({
    where: { role: { in: ['ADMIN', 'ASESOR', 'CLIENTE'] } },
    include: { permission: true },
  });
  console.log('ROLE_PERMISSIONS', JSON.stringify(rp, null, 2));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
