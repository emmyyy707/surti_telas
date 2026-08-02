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

    const ruta = await request('GET', '/api/v1/deliveries/ruta-del-dia', null, token);
    console.log('Ruta status:', ruta.status);
    console.log('Ruta body:', JSON.stringify(ruta.body, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
})();
