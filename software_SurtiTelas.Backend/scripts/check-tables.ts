const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTables() {
  const tables = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;
  console.log('Tables in public schema:');
  tables.forEach(t => console.log(' -', t.table_name));
  
  const pedidosTable = tables.find(t => t.table_name === 'pedidos_personalizados');
  console.log('\npedidos_personalizados exists:', !!pedidosTable);
  
  const auditTable = tables.find(t => t.table_name === 'audit_logs');
  console.log('audit_logs exists:', !!auditTable);

  await prisma.$disconnect();
}

checkTables().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
