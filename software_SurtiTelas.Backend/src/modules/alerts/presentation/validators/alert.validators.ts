import { z } from 'zod';

export const AlertFiltersSchema = z.object({
  estado: z.enum(['PENDIENTE', 'LEIDA', 'RESUELTA', 'CANCELADA']).optional(),
  modulo: z.string().optional(),
  prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']).optional(),
  leida: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.string().optional(),
  sort: z.enum(['createdAt', 'prioridad', 'estado']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export const CreateAlertSchema = z.object({
  tipo: z.enum(['INFO', 'WARNING', 'SUCCESS', 'DANGER']),
  modulo: z.string().min(1),
  referenciaId: z.string().optional(),
  mensaje: z.string().min(1),
  prioridad: z.enum(['BAJA', 'MEDIA', 'ALTA', 'CRITICA']).optional(),
  metadata: z.record(z.unknown()).optional(),
  estado: z.enum(['PENDIENTE', 'LEIDA', 'RESUELTA', 'CANCELADA']).optional(),
});
