import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const u = await prisma.user.findUnique({ where: { email: 'admin@surtitelas.com' } });
  if (!u) { console.log('NO EXISTE admin'); return; }
  console.log('hash:', u.passwordHash.slice(0, 20), '...');
  for (const pwd of ['SurtiTelas2025*', 'SurtiTelas2025', 'admin123', '12345']) {
    const ok = await bcrypt.compare(pwd, u.passwordHash);
    console.log(`compare "${pwd}": ${ok}`);
  }
}
main().catch((e)=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
