import { z } from 'zod';
import { OptionalPhoneSchema, OptionalNitSchema, NonNegativeNumberSchema } from '../../../../shared/presentation/validators';

export const CreateCustomerSchema = z
  .object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    ciudad: z.string().min(1).optional(),
    telefono: OptionalPhoneSchema,
    tel: z.string().min(1).optional(),
    asesorId: z.string().optional(),
    nit: OptionalNitSchema,
    cupoTotal: NonNegativeNumberSchema.optional(),
    cupoUsado: NonNegativeNumberSchema.optional(),
    deudaVencida: NonNegativeNumberSchema.optional(),
    isTrustedCustomer: z.boolean().optional(),
    estado: z.enum(['Activo', 'Inactivo']).optional(),
  })
  .transform((data) => ({
    ...data,
    telefono: data.telefono ?? data.tel,
  }));

export const UpdateCustomerSchema = CreateCustomerSchema._def.schema
  .partial()
  .extend({ asesorId: z.string().optional() });

export const AssignAsesorSchema = z.object({
  asesorId: z.string().min(1, 'asesorId es obligatorio'),
});

export const UpdateCupoSchema = z.object({
  cupoTotal: NonNegativeNumberSchema,
  cupoUsado: NonNegativeNumberSchema,
});

export const CustomerFiltersSchema = z.object({
  search: z.string().optional(),
  asesorId: z.string().optional(),
  estado: z.enum(['Activo', 'Inactivo']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.string().optional(),
  sort: z.enum(['nombre', 'ciudad', 'createdAt']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});
