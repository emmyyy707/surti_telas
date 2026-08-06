import { z } from 'zod';

export const DomiciliarioFiltersSchema = z.object({
  zona: z.string().optional(),
  activo: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.string().optional(),
  sort: z.enum(['createdAt', 'zona', 'capacidad']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export const CreateDomiciliarioSchema = z.object({
  userId: z.string().min(1),
  zona: z.string().optional(),
  vehiculo: z.string().optional(),
  capacidad: z.coerce.number().int().positive().optional(),
});

export const UpdateDomiciliarioSchema = z.object({
  zona: z.string().optional(),
  vehiculo: z.string().optional(),
  capacidad: z.coerce.number().int().positive().optional(),
  activo: z.coerce.boolean().optional(),
});
