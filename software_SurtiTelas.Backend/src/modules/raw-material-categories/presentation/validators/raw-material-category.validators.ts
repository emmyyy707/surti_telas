import { z } from 'zod';

export const CreateRawMaterialCategorySchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  slug: z.string().min(1, 'El slug es obligatorio'),
  descripcion: z.string().optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO']).optional(),
});

export const UpdateRawMaterialCategorySchema = CreateRawMaterialCategorySchema.partial();

export const RawMaterialCategoryFiltersSchema = z.object({
  search: z.string().optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.string().optional(),
  sort: z.enum(['nombre', 'slug']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});
