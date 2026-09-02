import { z } from 'zod';
import { PositiveNumberSchema, PaginationSchema } from '../../../../shared/presentation/validators';

export const PaymentFiltersSchema = z.object({
  customerId: z.string().optional(),
  asesorId: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'REFUNDED', 'ANULADO']).optional(),
  search: z.string().optional(),
  ...PaginationSchema.shape,
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
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'REFUNDED', 'ANULADO']),
});

export const UpdatePaymentSchema = z.object({
  amount: PositiveNumberSchema.optional(),
  method: z.enum(['CASH', 'TRANSFER', 'CARD', 'OTHER']).optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const CancelPaymentSchema = z.object({
  motivoAnulacion: z.string().min(3, 'El motivo de anulación es obligatorio (mínimo 3 caracteres)').max(500, 'El motivo de anulación no debe exceder 500 caracteres'),
});
