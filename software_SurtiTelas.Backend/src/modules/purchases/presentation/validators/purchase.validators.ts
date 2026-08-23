import { z } from 'zod';
import { PositiveIntegerSchema, PositiveNumberSchema } from '../../../../shared/presentation/validators';

export const CreatePurchaseSchema = z.object({
  numero: z.string().min(1, 'El número es obligatorio'),
  proveedorId: z.string().min(1, 'El proveedor es obligatorio'),
  usuarioId: z.string().min(1, 'El usuario es obligatorio'),
  total: z.number().nonnegative('El total no puede ser negativo'),
  observaciones: z.string().optional(),
  items: z.array(
    z.object({
      rawMaterialId: z.string().optional(),
      nombre: z.string().min(1, 'El nombre es obligatorio'),
      cantidad: PositiveIntegerSchema,
      precioUnitario: PositiveNumberSchema,
    })
  ).min(1, 'Debe tener al menos un ítem'),
});

export const UpdatePurchaseSchema = z.object({
  observaciones: z.string().optional(),
  estado: z.enum(['PENDIENTE', 'RECIBIDA', 'CANCELADA', 'ANULADA']).optional(),
});

export const CancelPurchaseSchema = z.object({
  motivo: z.string().min(1, 'El motivo es obligatorio'),
});

export const AddItemSchema = z.object({
  rawMaterialId: z.string().optional(),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  cantidad: PositiveIntegerSchema,
  precioUnitario: PositiveNumberSchema,
});

export const PurchaseFiltersSchema = z.object({
  search: z.string().optional(),
  proveedorId: z.string().optional(),
  estado: z.enum(['PENDIENTE', 'RECIBIDA', 'CANCELADA', 'ANULADA']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.string().optional(),
  sort: z.enum(['fecha', 'total', 'numero']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});
