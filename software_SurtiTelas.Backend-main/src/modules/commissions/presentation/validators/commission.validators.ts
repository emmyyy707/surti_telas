import { z } from 'zod';
import { PositiveNumberSchema, PercentageSchema } from '../../../../shared/presentation/validators';

export const CommissionFiltersSchema = z.object({
  asesorId: z.string().optional(),
});

export const CreateCommissionSchema = z.object({
  asesorId: z.string().min(1),
  orderId: z.string().optional(),
  monto: PositiveNumberSchema,
  porcentaje: PercentageSchema,
  notas: z.string().optional(),
});
