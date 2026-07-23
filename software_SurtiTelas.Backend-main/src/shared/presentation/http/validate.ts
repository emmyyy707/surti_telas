import { z } from 'zod';
import { ValidationError } from '../../domain/errors';

export function parseDto<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ValidationError('Error de validación', result.error.errors);
  }
  return result.data;
}
