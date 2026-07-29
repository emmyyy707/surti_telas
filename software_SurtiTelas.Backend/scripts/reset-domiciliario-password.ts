import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const domiciliarioEmail = 'domiciliario@surtitelas.com';
  const newPassword = 'Surti2026!';
  const passwordHash = await bcrypt.hash(newPassword, 12);

  const user = await prisma.user.findUnique({ where: { email: domiciliarioEmail } });
  if (!user) {
    console.log('Usuario domiciliario no encontrado');
    return;
  }

  await prisma.user.update({
    where: { email: domiciliarioEmail },
    data: { passwordHash },
  });

  console.log(`Contraseña actualizada para ${domiciliarioEmail}: ${newPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
