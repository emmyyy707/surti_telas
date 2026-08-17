const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const order = await prisma.customOrder.findUnique({
    where: { id: 'cmswa9pwx000tigqwekrmogxd' },
    include: { items: true },
  });
  console.log(JSON.stringify(order, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
