import { z } from 'zod';
import { OptionalPhoneSchema } from '../../../../shared/presentation/validators';

export const CreateContactSchema = z.object({
  nombre: z.string(),
  email: z.string().email(),
  telefono: OptionalPhoneSchema,
  asunto: z.string(),
  mensaje: z.string(),
});

export const ListContactSchema = z.object({
  leida: z.boolean().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
