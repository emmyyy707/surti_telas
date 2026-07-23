import { z } from 'zod';
import { OptionalPhoneSchema, OptionalNitSchema } from '../../../../shared/presentation/validators';

export const UpdateCompanySchema = z.object({
  nombre: z.string().optional(),
  nit: OptionalNitSchema,
  telefono: OptionalPhoneSchema,
  email: z.string().optional(),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  logo: z.string().optional(),
  moneda: z.string().optional(),
});
