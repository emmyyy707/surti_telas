import { z } from 'zod';
import { PositiveNumberSchema, PositiveIntegerSchema } from '../../../../shared/presentation/validators';

export const CreateSaleSchema = z.object({
  orderId: z.string().min(1, 'orderId es obligatorio'),
  medioPago: z.enum(['CASH', 'TRANSFER', 'CARD', 'OTHER', 'INSTALLMENTS']).optional(),
  observaciones: z.string().optional(),
});

export const CancelSaleSchema = z.object({
  motivoAnulacion: z.string().min(3, 'El motivo de anulación debe tener al menos 3 caracteres').max(500, 'El motivo de anulación no debe excedar 500 caracteres'),
});

export const AddSaleItemSchema = z.object({
  nombre: z.string().min(1, 'El nombre del producto es obligatorio'),
  precio: PositiveNumberSchema,
  cantidad: PositiveIntegerSchema,
  productId: z.string().optional(),
});

export const SaleFiltersSchema = z.object({
  search: z.string().optional(),
  estado: z.string().optional(),
  clienteId: z.string().optional(),
  asesorId: z.string().optional(),
  desde: z.string().optional(),
  hasta: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});
