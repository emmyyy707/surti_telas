import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SurtiTelas API',
      version: '1.0.0',
      description: 'Backend API para la plataforma SurtiTelas - Manufactura y comercialización de prendas de vestir',
      contact: {
        name: 'SurtiTelas Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'cliente-123' },
            nombre: { type: 'string', example: 'Juan Pérez' },
            ciudad: { type: 'string', example: 'Bogotá' },
            tel: { type: 'string', example: '3001234567' },
            nit: { type: 'string', example: '900123456-7' },
            cupoTotal: { type: 'number', example: 500000 },
            cupoUsado: { type: 'number', example: 120000 },
            deudaVencida: { type: 'number', example: 0 },
            isTrustedCustomer: { type: 'boolean', example: false },
            estado: { type: 'string', enum: ['Activo', 'Inactivo'], example: 'Activo' },
            pedidos: { type: 'number', example: 3 },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'prod-123' },
            ref: { type: 'string', example: 'REF-001' },
            codigo: { type: 'string', example: 'CAM-001' },
            nombre: { type: 'string', example: 'Camiseta básica' },
            descripcion: { type: 'string', example: 'Camiseta 100% algodón' },
            descripcionCorta: { type: 'string', example: 'Camiseta básica' },
            categoria: { type: 'string', example: 'Camisetas' },
            subcategoria: { type: 'string', example: 'Manga corta' },
            marca: { type: 'string', example: 'SurtiTelas' },
            precio: { type: 'number', example: 25000 },
            precioAnterior: { type: 'number', example: 30000 },
            descuento: { type: 'number', example: 17 },
            cantidadStock: { type: 'number', example: 100 },
            stock: { type: 'string', enum: ['OK', 'Bajo stock', 'Agotado'], example: 'OK' },
            estado: { type: 'string', enum: ['Activo', 'Inactivo'], example: 'Activo' },
            imagenes: { type: 'array', items: { type: 'string' }, example: ['https://cdn.surtitelas.com/img1.jpg'] },
            imagenPrincipal: { type: 'string', example: 'https://cdn.surtitelas.com/img1.jpg' },
            publicado: { type: 'boolean', example: true },
            destacado: { type: 'boolean', example: false },
            oferta: { type: 'boolean', example: true },
            nuevo: { type: 'boolean', example: false },
            masVendido: { type: 'boolean', example: true },
            tela: { type: 'string', example: 'Algodón' },
            colores: { type: 'array', items: { type: 'string' }, example: ['Blanco', 'Negro'] },
            tallas: { type: 'array', items: { type: 'string' }, example: ['S', 'M', 'L'] },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'order-123' },
            numero: { type: 'string', example: 'PED-000001' },
            cliente: { type: 'string', example: 'Juan Pérez' },
            asesor: { type: 'string', example: 'María Gómez' },
            fecha: { type: 'string', format: 'date-time', example: '2025-07-12T00:00:00.000Z' },
            total: { type: 'number', example: 50000 },
            items: { type: 'number', example: 2 },
            estado: { type: 'string', example: 'Nuevo' },
            prioridad: { type: 'string', enum: ['Estándar', 'Prioritario'], example: 'Estándar' },
            observaciones: { type: 'string', example: 'Entregar en la mañana' },
            createdAt: { type: 'string', format: 'date-time', example: '2025-07-12T00:00:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2025-07-12T00:00:00.000Z' },
            itemsList: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string', example: 'prod-123' },
                  nombre: { type: 'string', example: 'Camiseta básica' },
                  precio: { type: 'number', example: 25000 },
                  cantidad: { type: 'number', example: 2 },
                },
              },
              example: [
                { productId: 'prod-123', nombre: 'Camiseta básica', precio: 25000, cantidad: 2 },
              ],
            },
          },
        },
        Paginated: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {},
            },
            totalRecords: { type: 'number', example: 50 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            totalPages: { type: 'number', example: 5 },
            nextCursor: { type: 'string', nullable: true, example: 'cursorABC' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'not_found' },
            message: { type: 'string', example: 'Recurso no encontrado' },
          },
        },
        Return: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'ret-123' },
            numeroDevolucion: { type: 'string', example: 'DEV-0001' },
            orderId: { type: 'string', nullable: true, example: 'order-123' },
            prenda: { type: 'string', nullable: true, example: 'Camiseta' },
            referencia: { type: 'string', nullable: true, example: 'REF-001' },
            motivo: { type: 'string', nullable: true, example: 'Talla incorrecta' },
            cantidad: { type: 'integer', example: 2 },
            cantidadInspeccionada: { type: 'integer', example: 0 },
            fechaDevolucion: { type: 'string', format: 'date-time' },
            estado: { type: 'string', enum: ['RECIBIDO', 'EN_INSPECCION', 'APROBADO', 'RECHAZADO', 'EN_REPARACION', 'REINGRESADO', 'DESCARTADO'], example: 'RECIBIDO' },
            destino: { type: 'string', enum: ['REINGRESO_INVENTARIO', 'REPARACION', 'DESCARTE', 'DEVOLUCION_PROVEEDOR'], example: 'REINGRESO_INVENTARIO' },
            cliente: { type: 'string', nullable: true, example: 'Juan Pérez' },
            responsable: { type: 'string', nullable: true, example: 'María Gómez' },
            observaciones: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Delivery: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'del-123' },
            orderId: { type: 'string', example: 'order-123' },
            domiciliarioId: { type: 'string', nullable: true, example: 'user-123' },
            estado: { type: 'string', enum: ['ASIGNADO', 'EN_RUTA', 'ENTREGADO', 'FALLIDO'], example: 'ASIGNADO' },
            direccion: { type: 'string', nullable: true, example: 'Calle 123' },
            ciudad: { type: 'string', nullable: true, example: 'Bogotá' },
            telefono: { type: 'string', nullable: true, example: '3001234567' },
            notas: { type: 'string', nullable: true, example: 'Entregar en la mañana' },
            orderNumero: { type: 'string', nullable: true, example: 'PED-000001' },
            clienteNombre: { type: 'string', nullable: true, example: 'Juan Pérez' },
            domiciliarioNombre: { type: 'string', nullable: true, example: 'Carlos Domiciliario' },
            asignadoEn: { type: 'string', format: 'date-time', nullable: true },
            entregadoEn: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/presentation/routes/*.ts'],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));
};

export { specs };
