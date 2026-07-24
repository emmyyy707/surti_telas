import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const rolePermissions = await prisma.rolePermission.findMany({
    where: { role: 'CLIENTE' },
    include: { permission: true },
  });
  console.log('CLIENTE permissions:', rolePermissions.map(rp => rp.permission.code));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
