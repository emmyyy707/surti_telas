import { z } from 'zod';

export const CustomOrderStatusEnum = z.enum([
  'PENDIENTE',
  'ACEPTADO',
  'CANCELADO',
  'SOLICITUD_RECIBIDA',
  'COTIZADO',
  'COTIZACION_ACEPTADA',
  'COTIZACION_RECHAZADA',
  'PAGO_PENDIENTE',
  'PAGO_EN_VERIFICACION',
  'PAGO_APROBADO',
  'CONVERTIDO_A_PEDIDO',
  'EN_PRODUCCION',
  'COMPLETADO',
  'VENCIDO',
]);

export const QuotationStatusEnum = z.enum([
  'BORRADOR',
  'PENDIENTE',
  'ENVIADA',
  'ACEPTADA',
  'RECHAZADA',
  'CANCELADA',
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
  'PUNTO_CORAZON',
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
  distribucionTallas: z.record(z.number().int().nonnegative()).optional(),
  distribucionColores: z.record(z.string().min(1), z.number().int().nonnegative()).optional(),
  imagenesReferencia: z.array(z.string()).optional(),
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
}).superRefine((data, ctx) => {
  if (data.distribucionTallas && Object.keys(data.distribucionTallas).length > 0) {
    const suma = Object.values(data.distribucionTallas).reduce((acc, val) => acc + (Number(val) || 0), 0);
    if (suma !== data.cantidad) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La distribución de tallas no coincide con la cantidad total',
        path: ['distribucionTallas'],
      });
    }
  }
  if (data.distribucionColores && Object.keys(data.distribucionColores).length > 0) {
    const suma = Object.values(data.distribucionColores).reduce((acc, val) => acc + (Number(val) || 0), 0);
    if (suma !== data.cantidad) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La distribución de colores no coincide con la cantidad total',
        path: ['distribucionColores'],
      });
    }
  }
});

export const CreatePersonalizacionSchema = z.object({
  tipo: PersonalizationTypeEnum,
  descripcion: z.string().min(1, 'La descripción de la personalización es obligatoria'),
  valorCaracteristica: z.string().optional(),
  restricciones: z.string().optional(),
  costoEstimado: z.number().nonnegative().optional(),
  requiereAprobacion: z.boolean().optional(),
});

const CreateCustomOrderSchemaBase = z.object({
  clienteId: z.string().optional(),
  asesorId: z.string().optional(),
  clienteNombre: z.string().min(1, 'El nombre del cliente es obligatorio'),
  clienteEmail: z.string().email().optional().or(z.literal('')),
  clienteTelefono: z.string().optional(),
  descripcionGeneral: z.string().optional(),
  usoFinal: z.string().optional(),
  direccionEntrega: z.string().optional(),
  fechaEntregaDeseada: z.string().datetime().optional(),
  notasCliente: z.string().optional(),
  notasReferencia: z.string().optional(),
  paymentKey: z.string().optional(),
  paymentProofUrl: z.string().optional().or(z.literal('')),
  tecnica: z.string().optional(),
  tamano: z.string().optional(),
  cantidadDisenos: z.number().int().positive().optional(),
  numeroColores: z.string().optional(),
  items: z.array(CreateCustomOrderItemSchema).min(1, 'Debe incluir al menos un item'),
  personalizaciones: z.array(CreatePersonalizacionSchema).optional(),
});

export const CreateCustomOrderSchema = CreateCustomOrderSchemaBase.superRefine((data, ctx) => {
  if (data.fechaEntregaDeseada && new Date(data.fechaEntregaDeseada) <= new Date()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'La fecha de entrega debe ser futura',
      path: ['fechaEntregaDeseada'],
    });
  }
});

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
  validaHasta: z.string().datetime().refine((val) => new Date(val) > new Date(), 'La fecha de validez debe ser futura'),
  condicionesPago: z.string().optional(),
  observaciones: z.string().optional(),
  generadoPorId: z.string().optional(),
  generadoPorNombre: z.string().optional(),
  draft: z.boolean().optional(),
  detalles: z.array(QuotationDetalleSchema).min(1, 'Debe incluir al menos un detalle'),
  negotiationCount: z.number().int().nonnegative().optional(),
  negotiationHistory: z.array(z.object({
    step: z.number().int().positive(),
    reason: z.string().min(1),
    date: z.string().datetime(),
    user: z.string().min(1),
  })).optional(),
}).superRefine((data, ctx) => {
  const sumaDetalles = data.detalles.reduce((acc, detalle) => acc + (Number(detalle.subtotal) || 0), 0);
  if (Math.abs(sumaDetalles - data.subtotal) >= 0.01) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El subtotal no coincide con la suma de los detalles',
      path: ['subtotal'],
    });
  }
});

export const AcceptQuotationSchema = z.object({
  confirmacion: z.string().optional(),
});

export const RejectQuotationSchema = z.object({
  motivoRechazo: z.string().min(1, 'El motivo de rechazo es obligatorio'),
});

export const StartNegotiationSchema = z.object({
  message: z.string().min(1, 'El mensaje es obligatorio'),
  proposalData: z.any().optional(),
});

export const RespondToNegotiationSchema = z.object({
  message: z.string().min(1, 'El mensaje es obligatorio'),
  proposalData: z.any().optional(),
  parentId: z.string().optional(),
});

export const RejectNegotiationSchema = z.object({
  negotiationId: z.string().min(1, 'El ID de la negociación es requerido'),
  reason: z.string().optional(),
});

const UpdateCustomOrderSchemaBase = CreateCustomOrderSchemaBase.partial().extend({
  items: z.array(CreateCustomOrderItemSchema).optional(),
});

export const UpdateCustomOrderSchema = UpdateCustomOrderSchemaBase.superRefine((_data, _ctx) => {
  // Future cross-field validations can be added here
});

export { UpdateCustomOrderSchemaBase };

export const CustomOrderFiltersSchema = z.object({
  estado: CustomOrderStatusEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
}).passthrough();
