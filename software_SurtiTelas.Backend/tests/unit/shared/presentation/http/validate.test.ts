import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { parseDto } from '@/shared/presentation/http/validate';
import { ValidationError } from '@/shared/domain/errors';

const schema = z.object({ name: z.string().min(1) });

describe('parseDto', () => {
  it('returns the parsed data on success', () => {
    expect(parseDto(schema, { name: 'Ana' })).toEqual({ name: 'Ana' });
  });

  it('throws a ValidationError on failure', () => {
    expect(() => parseDto(schema, { name: 5 })).toThrow(ValidationError);
  });
});
