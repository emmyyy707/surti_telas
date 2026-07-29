import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const PASSWORD = 'SurtiTelas2026*';

async function main() {
  const users = [
    { email: 'admin@surtitelas.com', label: 'ADMIN' },
    { email: 'asesor@surtitelas.com', label: 'ASESOR' },
    { email: 'domiciliario@surtitelas.com', label: 'DOMICILIARIO' },
  ];

  for (const u of users) {
    const user = await prisma.user.findUnique({ where: { email: u.email } });
    if (!user) {
      console.log(`SKIP ${u.label}: user not found`);
      continue;
    }
    await prisma.user.update({
      where: { email: u.email },
      data: {
        passwordHash: await bcrypt.hash(PASSWORD, 12),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
    console.log(`OK ${u.label}: ${u.email} / ${PASSWORD}`);
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
