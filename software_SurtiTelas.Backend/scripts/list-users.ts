import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ where: { estado: 'ACTIVO' }, select: { id: true, email: true, nombre: true, role: true } });
  console.log('USERS:', JSON.stringify(users, null, 2));
  const customers = await prisma.customer.findMany({ select: { id: true, email: true, nombre: true } });
  console.log('CUSTOMERS:', JSON.stringify(customers, null, 2));
  await prisma.$disconnect();
}
main();
