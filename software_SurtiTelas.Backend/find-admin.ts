import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const user = await p.user.findFirst({
    where: { email: 'admin@surtitelas.com' },
    select: { id: true, email: true, role: true, estado: true }
  });
  console.log('Admin user:', JSON.stringify(user));
  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
