import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.permission.count();
  console.log('Permission count:', count);
  
  const users = await prisma.user.findMany();
  console.log('Users:', users.map(u => ({ email: u.email, role: u.role })));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
