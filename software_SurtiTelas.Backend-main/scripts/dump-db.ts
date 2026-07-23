import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const prisma = new PrismaClient();

function sqlVal(v: unknown): string {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (v instanceof Date) return `'${v.toISOString()}'`;
  if (Array.isArray(v)) return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

async function main() {
  const tables: { table_name: string }[] = await prisma.$queryRawUnsafe(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name`
  );

  const out: string[] = [];
  out.push('-- Dump generado con Prisma Client (sin pg_dump)');
  out.push('-- SurtiTelas Backend');
  out.push('');

  for (const { table_name } of tables) {
    const cols: { column_name: string; data_type: string }[] = await prisma.$queryRawUnsafe(
      `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`,
      table_name
    );
    const colNames = cols.map((c) => c.column_name);
    const rows: Record<string, unknown>[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "${table_name}"`
    );

    out.push(`-- Tabla: ${table_name} (${rows.length} filas)`);
    for (const row of rows) {
      const vals = colNames.map((cn) => sqlVal(row[cn]));
      out.push(
        `INSERT INTO "${table_name}" (${colNames.map((c) => `"${c}"`).join(', ')}) VALUES (${vals.join(', ')});`
      );
    }
    out.push('');
  }

  const file = join(process.cwd(), 'surtitelas-dump.sql');
  writeFileSync(file, out.join('\n'), 'utf8');
  console.log(`Dump escrito en: ${file}`);
  console.log(`Tablas: ${tables.length}, total filas: ${out.filter((l) => l.startsWith('INSERT')).length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
