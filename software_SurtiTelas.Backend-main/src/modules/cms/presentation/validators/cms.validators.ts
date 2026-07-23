import { z } from 'zod';

export const CmsFiltersSchema = z.object({
  slug: z.string().optional(),
});

export const CreateCmsSchema = z.object({
  slug: z.string(),
  titulo: z.string(),
  contenido: z.string().optional(),
  publicado: z.boolean().optional(),
});

export const UpdateCmsSchema = z.object({
  slug: z.string().optional(),
  titulo: z.string().optional(),
  contenido: z.string().optional(),
  publicado: z.boolean().optional(),
});
