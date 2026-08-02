const http = require('http');
const url = require('url');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const base = 'http://localhost:3000';
    const parsed = new url.URL(path, base);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  try {
    const login = await request('POST', '/api/v1/auth/login', {
      email: 'domiciliario@surtitelas.com',
      password: 'demo12345',
    });
    console.log('Login status:', login.status);
    const token = login.body?.accessToken || login.body?.data?.accessToken;
    if (!token) {
      console.log('Login body:', JSON.stringify(login.body, null, 2));
      return;
    }
    console.log('Login OK');

    const rutaBefore = await request('GET', '/api/v1/deliveries/ruta-del-dia', null, token);
    const itemsBefore = rutaBefore.body?.data || rutaBefore.body || [];
    console.log('Estado antes:', JSON.stringify(itemsBefore[0]?.estado || 'N/A', null, 2));

    if (!itemsBefore.length) {
      console.log('No hay entregas');
      return;
    }

    const id = itemsBefore[0].id;
    const update = await request('PATCH', `/api/v1/deliveries/${encodeURIComponent(id)}/status`, { estado: 'ENTREGADO' }, token);
    console.log('Update status:', update.status, JSON.stringify(update.body, null, 2));

    const rutaAfter = await request('GET', '/api/v1/deliveries/ruta-del-dia', null, token);
    const itemsAfter = rutaAfter.body?.data || rutaAfter.body || [];
    console.log('Estado despues:', JSON.stringify(itemsAfter[0]?.estado || 'N/A', null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
})();
