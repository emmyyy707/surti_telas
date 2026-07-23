import { z } from 'zod';
import { PositiveNumberSchema } from '../../../../shared/presentation/validators';

export const PaymentFiltersSchema = z.object({
  customerId: z.string().optional(),
  asesorId: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'REFUNDED']).optional(),
});

export const CreatePaymentSchema = z.object({
  orderId: z.string().min(1),
  customerId: z.string().min(1),
  asesorId: z.string().optional(),
  amount: PositiveNumberSchema,
  method: z.enum(['CASH', 'TRANSFER', 'CARD', 'OTHER']),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdatePaymentStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'REFUNDED']),
});

export const UpdatePaymentSchema = z.object({
  amount: PositiveNumberSchema.optional(),
  method: z.enum(['CASH', 'TRANSFER', 'CARD', 'OTHER']).optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});
