import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@surtitelas.com' } });
  if (!admin) {
    console.log('Admin not found');
    return;
  }
  console.log('Admin found:', admin.email, 'role:', admin.role, 'estado:', admin.estado);
  
  const match = await bcrypt.compare('SurtiTelas2025*', admin.passwordHash);
  console.log('Password matches:', match);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
