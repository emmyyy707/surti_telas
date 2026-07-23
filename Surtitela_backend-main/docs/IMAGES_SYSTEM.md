# Sistema de Gestión de Imágenes - Documentación

## Arquitectura

```
Frontend
    ↓
Backend (Express.js)
    ↓
Multer (uploads/temp/)
    ↓
Validación (tipo, tamaño, MIME)
    ↓
Cloudinary (almacenamiento + optimización)
    ↓
Eliminar archivo temporal
    ↓
Prisma guarda URL en PostgreSQL
```

## Estructura de Carpetas

```
backend/
├── src/
│   └── modules/
│       └── uploads/
│           ├── controller/
│           ├── service/
│           └── routes/
└── uploads/
    └── temp/          ← CARPETA TEMPORAL ÚNICAMENTE
```

## Flujo de Procesamiento

1. **Recepción**: Multer guarda imagen temporalmente en `uploads/temp/`
2. **Validación**: 
   - Tipo: jpg, jpeg, png, webp, svg
   - Tamaño máximo: 5MB
   - MIME type verification
3. **Optimización**: Cloudinary optimiza automáticamente
4. **Almacenamiento**: Subida a Cloudinary CDN
5. **Limpieza**: Eliminación archivo temporal
6. **Persistencia**: Guardar URL en PostgreSQL via Prisma

## Endpoint: POST /api/uploads

### Request
- Headers: `Authorization: Bearer <token>`
- Body: `multipart/form-data`
- Field: `file` (imagen)

### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "url": "https://res.cloudinary.com/...",
    "publicId": "...",
    "size": 250000,
    "width": 1200,
    "height": 800,
    "mimeType": "image/webp"
  }
}
```

## Endpoint: DELETE /api/uploads/:id

Elimina imagen de Cloudinary y base de datos.

## Endpoint: PUT /api/uploads/:id/replace

Reemplaza imagen existente.

## Configuración Cloudinary

```env
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

## Optimización Automática

- Calidad: `auto:good`
- Formato: `auto` (WebP cuando es posible)
- Metadata: eliminada