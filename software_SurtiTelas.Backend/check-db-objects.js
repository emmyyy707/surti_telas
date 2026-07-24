const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const views = await prisma.$queryRaw`
      SELECT table_name, view_definition 
      FROM information_schema.views 
      WHERE table_schema = 'public'
    `;
    console.log('Views:', views);
    
    const triggers = await prisma.$queryRaw`
      SELECT trigger_name, event_object_table, action_statement
      FROM information_schema.triggers
      WHERE event_object_schema = 'public'
    `;
    console.log('Triggers:', triggers);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
