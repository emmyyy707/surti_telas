import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    const role = await prisma.roleConfig.create({
      data: { role: 'ROL_PERSONALIZADO_TEST', estado: 'ACTIVO', descripcion: 'Test' },
    });
    console.log('Created role:', role);
  } catch (error) {
    console.error('Error creating role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
