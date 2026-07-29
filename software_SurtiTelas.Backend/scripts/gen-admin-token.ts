import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@surtitelas.com' },
    select: { id: true, email: true, nombre: true, role: true },
  });

  if (!admin) {
    console.log('Admin not found');
    return;
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, nombre: admin.nombre, role: admin.role, permissions: [] },
    'dev-access-secret-change-in-production-32-chars-min',
    { expiresIn: '15m' }
  );

  console.log('ADMIN_TOKEN=' + token);
}

main().finally(() => prisma.$disconnect());
