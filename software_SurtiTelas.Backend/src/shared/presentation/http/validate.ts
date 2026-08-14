import { z } from 'zod';
import { ValidationError } from '../../domain/errors';

export function parseDto<T>(schema: z.ZodSchema<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    const first = result.error.errors[0];
    const message = first ? `${first.path.join('.') || 'campo'}: ${first.message}` : 'Error de validación';
    throw new ValidationError(message, result.error.errors);
  }
  return result.data;
}
