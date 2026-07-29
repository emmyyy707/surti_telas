import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const permCount = await prisma.permission.count();
  const roleCount = await prisma.roleConfig.count();
  const userCount = await prisma.user.count();
  console.log('Permissions:', permCount);
  console.log('RoleConfigs:', roleCount);
  console.log('Users:', userCount);
  await prisma.$disconnect();
}

main().catch(console.error);
