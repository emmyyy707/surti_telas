import { z } from 'zod';
import { OptionalPhoneSchema } from '../../../../shared/presentation/validators';

export const DeliveryStatusEnum = z.enum(['ASIGNADO', 'EN_RUTA', 'ENTREGADO', 'FALLIDO']);

export const CreateDeliverySchema = z.object({
  orderId: z.string().min(1),
  domiciliarioId: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  telefono: OptionalPhoneSchema,
  notas: z.string().optional(),
});

export const UpdateDeliverySchema = z.object({
  domiciliarioId: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  telefono: OptionalPhoneSchema,
  notas: z.string().optional(),
  estado: DeliveryStatusEnum.optional(),
});

export const DeliveryFiltersSchema = z.object({
  estado: DeliveryStatusEnum.optional(),
  domiciliarioId: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  cursor: z.string().optional(),
});
