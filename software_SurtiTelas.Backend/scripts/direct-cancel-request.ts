import http from 'http';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtc3dwajl6cjAwMTlpZ29naWkxdWY5OG4iLCJlbWFpbCI6ImFkbWluQHN1cnRpdGVsYXMuY29tIiwibm9tYnJlIjoiQWRtaW5pc3RyYWRvciBTdXJ0aVRlbGFzIiwicm9sZSI6IkFETUlOIiwicGVybWlzc2lvbnMiOlsiY2F0YWxvZzpyZWFkIiwiY2F0YWxvZzpjcmVhdGUiLCJjYXRhbG9nOnVwZGF0ZSIsImNhdGFsb2c6ZGVsZXRlIiwiY2F0YWxvZzpwdWJsaXNoIiwiY3VzdG9tZXJzOnJlYWQiLCJjdXN0b21lcnM6Y3JlYXRlIiwiY3VzdG9tZXJzOnVwZGF0ZSIsIm9yZGVyczpyZWFkIiwib3JkZXJzOmNyZWF0ZSIsIm9yZGVyczp1cGRhdGUiLCJzdG9jazpyZWFkIiwic3RvY2s6Y3JlYXRlIiwic3RvY2s6bW92ZSIsInByb2R1Y3Rpb246cmVhZCIsInByb2R1Y3Rpb246Y3JlYXRlIiwicHJvZHVjdGlvbjp1cGRhdGUiLCJhdXRoOm1hbmFnZSIsInBheW1lbnRzOnJlYWQiLCJwYXltZW50czpjcmVhdGUiLCJwYXltZW50czp1cGRhdGUiLCJyZWNlaXB0czpyZWFkIiwicmVjZWlwdHM6Y3JlYXRlIiwiY29tbWlzc2lvbnM6cmVhZCIsImNvbW1pc3Npb25zOmNyZWF0ZSIsImNvbXBhbnk6dXBkYXRlIiwiY21zOnJlYWQiLCJjbXM6dXBkYXRlIiwiY29udGFjdDpyZWFkIiwic29tZXRoaW5nOnVwZGF0ZSIsInJldHVybnM6cmVhZCIsInJldHVybnM6Y3JlYXRlIiwicmV0dXJuczp1cGRhdGUiLCJkZWxpdmVyaWVzOnJlYWQiLCJkZWxpdmVyaWVzOmNyZWF0ZSIsImRlbGl2ZXJpZXM6dXBkYXRlIiwibm90aWZpY2F0aW9uczpyZWFkIiwibm90aWZpY2F0aW9uczp1cGRhdGUiLCJjdXN0b21lcnM6ZGVsZXRlIiwib3JkZXJzOmRlbGV0ZSIsInN0b2NrOnVwZGF0ZSIsInN0b2NrOmRlbGV0ZSIsInN0b2NrOm1hbmFnZSIsInByb2R1Y3Rpb246ZGVsZXRlIiwicGF5bWVudHM6ZGVsZXRlIiwicmVjZWlwdHM6dXBkYXRlIiwicmVjZWlwdHM6ZGVsZXRlIiwicGF5bWVudHM6dXBkYXRlIiwicmVjZWlwdHM6dXBkYXRlIiwicm91dGVzOnJlYWQiXX0.2WzL_kXQe2x9QEhUzSOF3akbBtY5reC-isIkJzSImZA';

const saleId = 'cmthpm7sd001aiglcoij1pllx';
const payload = JSON.stringify({ motivoAnulacion: 'Prueba de anulación válida' });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: `/api/v1/sales/${encodeURIComponent(saleId)}/cancel`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
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
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.write(payload);
req.end();
