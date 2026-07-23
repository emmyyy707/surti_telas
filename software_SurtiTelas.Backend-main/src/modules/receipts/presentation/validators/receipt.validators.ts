import { z } from 'zod';
import { PositiveNumberSchema } from '../../../../shared/presentation/validators';

export const ReceiptFiltersSchema = z.object({
  customerId: z.string().optional(),
  orderId: z.string().optional(),
});

export const CreateReceiptSchema = z.object({
  orderId: z.string().optional(),
  customerId: z.string().min(1),
  numero: z.string().min(1),
  total: PositiveNumberSchema,
  concepto: z.string().min(1),
  notas: z.string().optional(),
});

export const UpdateReceiptSchema = z.object({
  numero: z.string().min(1).optional(),
  total: PositiveNumberSchema.optional(),
  concepto: z.string().min(1).optional(),
  notas: z.string().optional(),
});

export const UpdateReceiptStatusSchema = z.object({
  estado: z.enum(['BORRADOR', 'ENVIADO', 'PAGADO', 'VENCIDO', 'CANCELADO']),
});
