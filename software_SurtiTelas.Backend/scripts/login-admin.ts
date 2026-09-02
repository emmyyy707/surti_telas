import https from 'https';
import http from 'http';

const payload = JSON.stringify({
  email: 'admin@surtitelas.com',
  password: 'SurtiTelas2025*',
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
    try {
      const parsed = JSON.parse(data);
      if (parsed.data?.accessToken) {
        console.log('ACCESS_TOKEN:', parsed.data.accessToken);
      }
    } catch {
      // ignore
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(payload);
req.end();
