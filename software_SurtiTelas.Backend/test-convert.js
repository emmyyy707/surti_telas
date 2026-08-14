const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function login() {
  const data = JSON.stringify({ email: 'admin@surtitelas.com', password: 'SurtiTelas2025*' });
  const res = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, data);
  return res.body.data.accessToken;
}

async function main() {
  const token = await login();
  const orderId = 'cmss3b5y70009igsksbx3z6q3';

  const res = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/admin/custom-orders/${orderId}/convert`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  }, JSON.stringify({}));

  console.log('Status:', res.status);
  console.log('Body:', JSON.stringify(res.body, null, 2));
}

main().catch(e => console.error(e));
