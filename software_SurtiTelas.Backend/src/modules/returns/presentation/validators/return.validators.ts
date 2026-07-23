import { z } from 'zod';
import { PositiveIntegerSchema, NonNegativeIntegerSchema } from '../../../../shared/presentation/validators';

export const ReturnStatusEnum = z.enum([
  'RECIBIDO',
  'EN_INSPECCION',
  'APROBADO',
  'RECHAZADO',
  'EN_REPARACION',
  'REINGRESADO',
  'DESCARTADO',
]);

export const ReturnDestinoEnum = z.enum([
  'REINGRESO_INVENTARIO',
  'REPARACION',
  'DESCARTE',
  'DEVOLUCION_PROVEEDOR',
]);

export const CreateReturnSchema = z.object({
  orderId: z.string().min(1, 'orderId es obligatorio'),
  prenda: z.string().min(1, 'La prenda es obligatoria'),
  referencia: z.string().min(1, 'La referencia es obligatoria'),
  motivo: z.string().min(1, 'El motivo es obligatorio'),
  cantidad: PositiveIntegerSchema,
  cantidadInspeccionada: NonNegativeIntegerSchema.optional(),
  destino: ReturnDestinoEnum.optional(),
  cliente: z.string().optional(),
  responsable: z.string().optional(),
  observaciones: z.string().optional(),
  fechaDevolucion: z.string().optional(),
});

export const UpdateReturnSchema = z.object({
  prenda: z.string().optional(),
  referencia: z.string().optional(),
  motivo: z.string().optional(),
  cantidad: PositiveIntegerSchema.optional(),
  cantidadInspeccionada: NonNegativeIntegerSchema.optional(),
  estado: ReturnStatusEnum.optional(),
  destino: ReturnDestinoEnum.optional(),
  cliente: z.string().optional(),
  responsable: z.string().optional(),
  observaciones: z.string().optional(),
});

export const ReturnFiltersSchema = z.object({
  estado: ReturnStatusEnum.optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  cursor: z.string().optional(),
});
