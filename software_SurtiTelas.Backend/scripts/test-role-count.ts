import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    const count = await prisma.user.count({ where: { role: 'ROL_PERSONALIZADO_TEST', deletedAt: null } });
    console.log('User count for custom role:', count);
  } catch (error) {
    console.error('Error counting users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
