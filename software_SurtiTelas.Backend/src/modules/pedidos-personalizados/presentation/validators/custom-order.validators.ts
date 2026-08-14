import { z } from 'zod';

export const CustomOrderStatusEnum = z.enum([
  'SOLICITUD_RECIBIDA',
  'EN_REVISION',
  'COTIZADO',
  'COTIZACION_ACEPTADA',
  'COTIZACION_RECHAZADA',
  'PAGO_PENDIENTE',
  'PAGO_EN_VERIFICACION',
  'PAGO_APROBADO',
  'CONVERTIDO_A_PEDIDO',
  'EN_PRODUCCION',
  'COMPLETADO',
  'CANCELADO',
  'VENCIDO',
]);

export const QuotationStatusEnum = z.enum([
  'BORRADOR',
  'ENVIADA',
  'ACEPTADA',
  'RECHAZADA',
  'VENCIDA',
]);

export const PersonalizationTypeEnum = z.enum([
  'DISENO_ESPECIAL',
  'MEDIDA_ESPECIFICA',
  'MATERIAL_PERSONALIZADO',
  'BORDADO_ESTAMPADO',
  'COLOR_PERSONALIZADO',
  'LOGOTIPO',
  'COMBINACION_MULTIPLE',
  'ESTAMPADO',
  'BORDADO',
  'SUBLIMACION',
  'VINILO',
  'OTRO',
]);

export const CustomOrderItemLocationEnum = z.enum([
  'FRENTE',
  'ESPALDA',
  'MANGA_IZQUIERDA',
  'MANGA_DERECHA',
  'PECHO',
  'OTRA',
]);

export const QuotationItemTypeEnum = z.enum([
  'PRODUCTO_BASE',
  'MATERIA_PRIMA',
  'MANO_OBRA',
  'DISENO',
  'LOGISTICA',
  'OTRO',
]);

export const CreateCustomOrderItemSchema = z.object({
  productoId: z.string().optional(),
  productoNombre: z.string().optional(),
  descripcion: z.string().min(1, 'La descripción del item es obligatoria'),
  tipoPersonalizacion: PersonalizationTypeEnum,
  especificaciones: z.string().optional(),
  cantidad: z.number().int().positive('La cantidad debe ser mayor a 0'),
  unidadMedida: z.string().optional(),
  talla: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  ubicacion: z.array(z.string()).optional(),
  distribucionTallas: z.record(z.number().int().positive()).optional(),
  distribucionColores: z.record(z.string().min(1), z.number().int().positive()).optional(),
  referenciaImagen: z.string().url().optional(),
  archivosReferencia: z.array(z.string().url()).optional(),
  imagenesAdjuntas: z.array(z.string().url()).optional(),
  observaciones: z.string().optional(),
  orden: z.number().int().optional(),
  personalizaciones: z.array(
    z.object({
      tipo: PersonalizationTypeEnum,
      tecnica: z.string().optional(),
      ubicacion: z.array(CustomOrderItemLocationEnum).optional(),
      descripcion: z.string().min(1, 'La descripción de la personalización es obligatoria'),
      archivos: z.array(z.string()).optional(),
      orden: z.number().int().optional(),
      variantes: z.array(
        z.object({
          talla: z.string().min(1, 'La talla es obligatoria'),
          color: z.string().min(1, 'El color es obligatorio'),
          cantidad: z.number().int().positive('La cantidad debe ser mayor a 0'),
        })
      ).optional(),
    })
  ).optional(),
}).passthrough();

export const CreatePersonalizacionSchema = z.object({
  tipo: PersonalizationTypeEnum,
  descripcion: z.string().min(1, 'La descripción de la personalización es obligatoria'),
  valorCaracteristica: z.string().optional(),
  restricciones: z.string().optional(),
  costoEstimado: z.number().nonnegative().optional(),
  requiereAprobacion: z.boolean().optional(),
});

export const CreateCustomOrderSchema = z.object({
  clienteId: z.string().optional(),
  asesorId: z.string().optional(),
  clienteNombre: z.string().min(1, 'El nombre del cliente es obligatorio'),
  clienteEmail: z.string().email().optional(),
  clienteTelefono: z.string().optional(),
  descripcionGeneral: z.string().optional(),
  usoFinal: z.string().optional(),
  fechaEntregaDeseada: z.string().optional(),
  notasCliente: z.string().optional(),
  notasReferencia: z.string().optional(),
  paymentKey: z.string().optional(),
  paymentProofUrl: z.string().url().optional(),
  tecnica: z.string().optional(),
  tamano: z.string().optional(),
  cantidadDisenos: z.number().int().positive().optional(),
  numeroColores: z.string().optional(),
  items: z.array(CreateCustomOrderItemSchema).min(1, 'Debe incluir al menos un item'),
  personalizaciones: z.array(CreatePersonalizacionSchema).optional(),
}).passthrough();

export const QuotationDetalleSchema = z.object({
  tipo: QuotationItemTypeEnum,
  descripcion: z.string().min(1, 'La descripción del detalle es obligatoria'),
  cantidad: z.number().int().positive('La cantidad debe ser mayor a 0'),
  unidadMedida: z.string().optional(),
  precioUnitario: z.number().nonnegative('El precio unitario no puede ser negativo'),
  subtotal: z.number().nonnegative('El subtotal no puede ser negativo'),
  observaciones: z.string().optional(),
  orden: z.number().int().optional(),
});

export const QuotationSchema = z.object({
  subtotal: z.number().nonnegative(),
  impuestos: z.number().nonnegative().optional(),
  descuento: z.number().nonnegative().optional(),
  tiempoEstimadoDias: z.number().int().positive().optional(),
  validaHasta: z.string().datetime(),
  condicionesPago: z.string().optional(),
  observaciones: z.string().optional(),
  generadoPorId: z.string().optional(),
  generadoPorNombre: z.string().optional(),
  detalles: z.array(QuotationDetalleSchema).min(1, 'Debe incluir al menos un detalle'),
});

export const AcceptQuotationSchema = z.object({
  confirmacion: z.string().optional(),
});

export const RejectQuotationSchema = z.object({
  motivoRechazo: z.string().min(1, 'El motivo de rechazo es obligatorio'),
});

export const UpdateCustomOrderSchema = CreateCustomOrderSchema.partial().extend({
  items: z.array(CreateCustomOrderItemSchema).optional(),
});

export const CustomOrderFiltersSchema = z.object({
  estado: CustomOrderStatusEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
}).passthrough();
