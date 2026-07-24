const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'receipts' 
        AND table_schema = 'public' 
      ORDER BY ordinal_position
    `;
    console.log('Receipts columns:');
    columns.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
