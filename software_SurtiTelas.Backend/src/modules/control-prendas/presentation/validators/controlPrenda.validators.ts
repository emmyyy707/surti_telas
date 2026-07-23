import { z } from 'zod';
import { PositiveIntegerSchema, NonNegativeIntegerSchema } from '../../../../shared/presentation/validators';

export const CreateControlPrendaSchema = z.object({
  produccionId: z.string().min(1, 'La producción es obligatoria'),
  etapa: z.enum(['CORTE', 'CONFECCION', 'ACABADO', 'CONTROL_CALIDAD', 'EMPAQUE']),
  cantidadTotal: PositiveIntegerSchema,
  cantidadRevisada: NonNegativeIntegerSchema.optional(),
  cantidadAprobada: NonNegativeIntegerSchema.optional(),
  cantidadRechazada: NonNegativeIntegerSchema.optional(),
  observaciones: z.string().optional(),
  revisadoPorId: z.string().optional(),
});

export const UpdateControlPrendaSchema = z.object({
  etapa: z.enum(['CORTE', 'CONFECCION', 'ACABADO', 'CONTROL_CALIDAD', 'EMPAQUE']).optional(),
  estado: z.enum(['PROCESO', 'APROBADO', 'RECHAZADO']).optional(),
  cantidadTotal: PositiveIntegerSchema.optional(),
  cantidadRevisada: NonNegativeIntegerSchema.optional(),
  cantidadAprobada: NonNegativeIntegerSchema.optional(),
  cantidadRechazada: NonNegativeIntegerSchema.optional(),
  observaciones: z.string().optional(),
  revisadoPorId: z.string().optional(),
});

export const ReviewControlPrendaSchema = z.object({
  estado: z.enum(['APROBADO', 'RECHAZADO']),
  observaciones: z.string().optional(),
});

export const ControlPrendaFiltersSchema = z.object({
  produccionId: z.string().optional(),
  etapa: z.enum(['CORTE', 'CONFECCION', 'ACABADO', 'CONTROL_CALIDAD', 'EMPAQUE']).optional(),
  estado: z.enum(['PROCESO', 'APROBADO', 'RECHAZADO']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.string().optional(),
  sort: z.enum(['createdAt', 'etapa', 'estado']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});
