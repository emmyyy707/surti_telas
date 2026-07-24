import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = bcrypt.hashSync('SurtiTelas2025*', 12);
  const user = await prisma.user.update({
    where: { email: 'admin@surtitelas.com' },
    data: { passwordHash },
  });
  console.log('Contraseña actualizada:', user.email);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
