import { z } from 'zod';
import { PositiveNumberSchema, PositiveIntegerSchema } from '../../../../shared/presentation/validators';

export const CreateOrderSchema = z.object({
  clienteId: z.string().min(1, 'clienteId es obligatorio'),
  asesorId: z.string().min(1).optional(),
  itemsList: z
    .array(
      z.object({
        productId: z.string().optional(),
        nombre: z.string().min(1, 'El item requiere nombre'),
        precio: PositiveNumberSchema,
        cantidad: PositiveIntegerSchema,
      })
    )
    .optional(),
  prioridad: z.enum(['Estándar', 'Prioritario']).optional(),
  observaciones: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'TRANSFER', 'CARD', 'OTHER']).optional(),
  installments: z.coerce.number().int().positive().max(12).optional(),
});

export const UpdateOrderStatusSchema = z.object({
  estado: z.enum([
    'Nuevo',
    'En producción',
    'Listo',
    'Despachado',
    'En camino',
    'Entregado',
    'Cancelado',
  ]),
});

export const AssignDomiciliarioSchema = z.object({
  domiciliarioId: z.string().min(1, 'domiciliarioId es obligatorio'),
});

export const UpdateOrderFullSchema = z.object({
  clienteId: z.string().min(1).optional(),
  asesorId: z.string().min(1).optional(),
  prioridad: z.enum(['Estándar', 'Prioritario']).optional(),
  observaciones: z.string().optional(),
  itemsList: z
    .array(
      z.object({
        productId: z.string().optional(),
        nombre: z.string().min(1),
        precio: PositiveNumberSchema,
        cantidad: PositiveIntegerSchema,
      })
    )
    .optional(),
});

export const OrderFiltersSchema = z.object({
  estado: z.enum(['Nuevo', 'En producción', 'Listo', 'Despachado', 'En camino', 'Entregado', 'Cancelado']).optional(),
  clienteId: z.string().optional(),
  asesorId: z.string().optional(),
  desde: z.string().optional(),
  hasta: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.string().optional(),
  sort: z.enum(['fecha', 'total', 'estado']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});
