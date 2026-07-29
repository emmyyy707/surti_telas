import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@surtitelas.com';
  const asesorEmail = 'asesor@surtitelas.com';
  const domiciliarioEmail = 'domiciliario@surtitelas.com';

  const defaultPassword = 'admin123';

  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (admin) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { passwordHash: await bcrypt.hash(defaultPassword, 12) },
    });
    console.log(`✓ Admin password reset: ${adminEmail} / ${defaultPassword}`);
  }

  const asesor = await prisma.user.findUnique({ where: { email: asesorEmail } });
  if (asesor) {
    await prisma.user.update({
      where: { email: asesorEmail },
      data: { passwordHash: await bcrypt.hash(defaultPassword, 12) },
    });
    console.log(`✓ Asesor password reset: ${asesorEmail} / ${defaultPassword}`);
  }

  const domiciliario = await prisma.user.findUnique({ where: { email: domiciliarioEmail } });
  if (domiciliario) {
    await prisma.user.update({
      where: { email: domiciliarioEmail },
      data: { passwordHash: await bcrypt.hash(defaultPassword, 12) },
    });
    console.log(`✓ Domiciliario password reset: ${domiciliarioEmail} / ${defaultPassword}`);
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
