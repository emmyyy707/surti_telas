import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN', estado: 'ACTIVO' }, select: { id: true, nombre: true, email: true } });
  console.log('ADMIN:', JSON.stringify(admin, null, 2));
  await prisma.$disconnect();
}
main();
