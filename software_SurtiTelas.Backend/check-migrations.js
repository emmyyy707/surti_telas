const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const rows = await prisma.$queryRaw`
      SELECT migration_name FROM _prisma_migrations ORDER BY finished_at DESC
    `;
    console.log(rows.map(r => r.migration_name).join('\n'));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
