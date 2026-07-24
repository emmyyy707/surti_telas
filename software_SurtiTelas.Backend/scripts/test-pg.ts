import pg from 'pg';

const { Client } = pg;

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:12345@localhost:5432/surtitelas?schema=public'
  });
  
  await client.connect();
  console.log('Connected');
  
  const count = await client.query('SELECT count(*) FROM users');
  console.log('Count:', count.rows[0].count);
  
  const users = await client.query('SELECT id, email FROM users LIMIT 5');
  console.log('Users:', users.rows);
  
  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
