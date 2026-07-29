import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@surtitelas.com';
  const newPassword = 'Admin123!';
  const passwordHash = await bcrypt.hash(newPassword, 12);

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { passwordHash },
    });
    console.log(`Contraseña de ${adminEmail} actualizada a: ${newPassword}`);
  } else {
    await prisma.user.create({
      data: {
        email: adminEmail,
        nombre: 'Administrador SurtiTelas',
        passwordHash,
        role: Role.ADMIN,
      },
    });
    console.log(`Admin creado: ${adminEmail} / ${newPassword}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
