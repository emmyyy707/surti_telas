const API_BASE = 'http://localhost:3000/api/v1';

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, text };
}

async function main() {
  const loginRes = await request('POST', '/auth/login', {
    email: 'admin@surtitelas.com',
    password: 'SurtiTelas2025*',
  });
  const token = JSON.parse(loginRes.text).data.accessToken;

  console.log('=== BUG-1: GET /orders ===');
  const ordersRes = await request('GET', '/orders', null, token);
  console.log('Status:', ordersRes.status);
  if (ordersRes.status === 200) {
    const orders = JSON.parse(ordersRes.text).data.items;
    console.log('Total orders returned:', orders.length);
    const affected = orders.filter((o: any) => ['PED-220110', 'PED-301874', 'PED-409564', 'PED-503863'].includes(o.numero));
    console.log('Affected orders found:', affected.length);
    affected.forEach((o: any) => console.log(`  ${o.numero}: items=${o.items}`));
  }

  console.log('\n=== BUG-2: PED-523307 y PED-000003 ===');
  const ids = [
    { id: 'cmtgtdira0003iglwdoveehhn', num: 'PED-523307' },
    { id: 'cmt10ravq0023igsgh59sft12', num: 'PED-000003' },
  ];
  for (const o of ids) {
    const res = await request('GET', `/orders/${o.id}`, null, token);
    const data = JSON.parse(res.text).data;
    console.log(`${o.num}: estado=${data.estado}, venta=${data.venta ? 'EXISTS' : 'NULL'}`);
  }
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
