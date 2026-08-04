import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'asesor@surtitelas.com';
  const newPassword = 'asesor123';

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash: hashedPassword },
    select: { id: true, email: true, nombre: true, role: true },
  });

  console.log('Contraseña actualizada correctamente');
  console.log(JSON.stringify({ email: user.email, nombre: user.nombre, role: user.role, password: newPassword }, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
