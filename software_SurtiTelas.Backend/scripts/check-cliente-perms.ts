import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'cliente@surtitelas.com' },
    include: { rolePermissions: { include: { permission: true } } },
  });
  console.log('CLIENTE ROLE:', user?.role);
  const perms = user?.rolePermissions?.map((rp) => rp.permission.code) || [];
  console.log('PERMISSIONS:', perms);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
