import { z } from 'zod';

export const NotificationFiltersSchema = z.object({
  leida: z.boolean().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.string().optional(),
  sort: z.enum(['createdAt', 'leida']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export const CreateNotificationSchema = z.object({
  tipo: z.enum(['INFO', 'WARNING', 'SUCCESS', 'DANGER']),
  titulo: z.string().min(1, 'El título es obligatorio'),
  mensaje: z.string().min(1, 'El mensaje es obligatorio'),
  usuarioId: z.string().optional(),
});

export const UpdateNotificationSchema = z.object({
  titulo: z.string().min(1).optional(),
  mensaje: z.string().min(1).optional(),
  leida: z.boolean().optional(),
});
