const http = require('http');
const fs = require('fs');
const path = require('path');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtc3pnam9mYjAwMHFpZ2NncHR5NWU0bXAiLCJlbWFpbCI6ImFuZHJlcy50ZXN0QGV4YW1wbGUuY29tIiwibm9tYnJlIjoiQW5kcmVzIiwicm9sZSI6IkNMSUVOVEUiLCJwZXJtaXNzaW9ucyI6WyJjYXRhbG9nOnJlYWQiLCJvcmRlcnM6cmVhZCIsIm9yZGVyczpjcmVhdGUiLCJjdXN0b21lcnM6cmVhZCIsIm5vdGlmaWNhdGlvbnM6cmVhZCJdLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzg3MTA2NzIxLCJleHAiOjE3ODcxMDc2MjF9.yissHHo2ocGncUGh2o4EBeI82GH6mwkl_rdv9KjnBFE';

const payload = {
  clienteId: 'cmszgjofb000qigcgpty5e4mp',
  clienteNombre: 'Andres Ruiz',
  clienteEmail: 'andres.test@example.com',
  clienteTelefono: '3015693683',
  direccionEntrega: 'Calle 123',
  notasReferencia: '',
  descripcionGeneral: 'Item de prueba',
  usoFinal: '',
  fechaEntregaDeseada: '2026-12-31T00:00:00.000Z',
  notasCliente: '',
  items: [
    {
      descripcion: 'Item de prueba',
      tipoPersonalizacion: 'ESTAMPADO',
      especificaciones: '',
      cantidad: 1,
      talla: 'M',
      color: 'Rojo',
      material: 'Algodon',
      ubicacion: ['ESPALDA'],
      distribucionTallas: {},
      imagenesReferencia: [],
      orden: 0,
      personalizaciones: [
        {
          tipo: 'ESTAMPADO',
          tecnica: 'ESTAMPADO',
          ubicacion: ['ESPALDA'],
          descripcion: 'me gustaria un Pikachu',
          archivos: [],
          orden: 0,
          variantes: [
            {
              talla: 'M',
              color: 'Rojo',
              cantidad: 1
            }
          ]
        }
      ]
    }
  ]
};

const postData = JSON.stringify(payload);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/custom-orders',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(postData);
req.end();
