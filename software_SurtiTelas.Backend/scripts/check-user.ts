import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { id: 'cmsxfo24m002oigek2t92wufo' },
    select: { id: true, email: true, nombre: true, apellidos: true, role: true, estado: true },
  });

  if (user) {
    console.log('User found:', JSON.stringify(user, null, 2));
  } else {
    console.log('User not found');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
