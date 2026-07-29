import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@surtitelas.com' },
    select: { id: true, email: true, passwordHash: true },
  });

  if (!admin) {
    console.log('Admin not found');
    return;
  }

  const testPassword = 'Admin123!';
  const valid = await bcrypt.compare(testPassword, admin.passwordHash);
  console.log('Email:', admin.email);
  console.log('Hash:', admin.passwordHash);
  console.log('Password valid:', valid);

  await prisma.$disconnect();
}

main().catch(console.error);
