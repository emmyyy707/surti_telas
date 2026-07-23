import { z } from 'zod';

export const DateRangeSchema = z
  .object({
    from: z.string().datetime({ offset: true }).optional(),
    to: z.string().datetime({ offset: true }).optional(),
  })
  .partial();

export type DateRangeDto = z.infer<typeof DateRangeSchema>;
