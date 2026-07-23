import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@surtitelas.com';
  const hash = await bcrypt.hash('SurtiTelas2025*', 12);
  const updated = await prisma.user.update({
    where: { email },
    data: { passwordHash: hash, role: Role.ADMIN },
  });
  console.log(`Admin ${updated.email} actualizado con password del doc`);
  const ok = await bcrypt.compare('SurtiTelas2025*', updated.passwordHash);
  console.log('verify SurtiTelas2025*:', ok);
}
main().catch((e)=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
