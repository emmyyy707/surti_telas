import { z } from 'zod';

export const CreateAuditLogSchema = z.object({
  accion: z.string().min(1, 'La acción es obligatoria'),
  modulo: z.string().min(1, 'El módulo es obligatorio'),
  usuarioId: z.string().optional(),
  referenciaId: z.string().optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const UpdateAuditLogSchema = z.object({
  accion: z.string().min(1).optional(),
  modulo: z.string().min(1).optional(),
  referenciaId: z.string().optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const AuditLogFiltersSchema = z.object({
  usuarioId: z.string().optional(),
  modulo: z.string().optional(),
  accion: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.string().optional(),
  sort: z.enum(['createdAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});
