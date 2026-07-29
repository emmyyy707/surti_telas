import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = [
    { email: 'cliente@surtitelas.com', password: 'Surti2026!' },
    { email: 'asesor@surtitelas.com', password: 'Surti2026!' },
  ];

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    const user = await prisma.user.findUnique({ where: { email: u.email } });
    if (!user) {
      console.log(`Usuario ${u.email} no encontrado`);
      continue;
    }
    await prisma.user.update({
      where: { email: u.email },
      data: { passwordHash },
    });
    console.log(`Contraseña actualizada para ${u.email}: ${u.password}`);
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
