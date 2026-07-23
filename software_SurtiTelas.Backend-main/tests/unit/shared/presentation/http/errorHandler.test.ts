import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { errorHandler } from '@/shared/presentation/http/errorHandler';
import { ValidationError } from '@/shared/domain/errors';

const mockRes = () => {
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as any;
};

const run = (err: unknown, reqOverrides = {}) => {
  const res = mockRes();
  const req = { requestId: 'req-123', ...reqOverrides };
  errorHandler(err, req as any, res, vi.fn() as any);
  return res;
};

describe('errorHandler', () => {
  it('handles entity.parse.failed / status 400', () => {
    const res = run({ type: 'entity.parse.failed' });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'bad_request', message: 'Cuerpo JSON inválido' });
  });

  it('handles body parser error with status 400', () => {
    const res = run({ type: 'entity.parse.failed', status: 400 });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'bad_request', message: 'Cuerpo JSON inválido' });
  });

  it('handles a ZodError using the first issue', () => {
    let zodError: unknown;
    try {
      z.object({ name: z.string() }).parse({ name: 5 });
    } catch (e) {
      zodError = e;
    }
    const res = run(zodError!);
    expect(res.status).toHaveBeenCalledWith(422);
    const body = res.json.mock.calls[0][0];
    expect(body.error).toBe('validation_error');
    expect(body.details).toBeDefined();
  });

  it('handles a ZodError with no issues', () => {
    const res = run(new z.ZodError([]));
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json.mock.calls[0][0].message).toBe('Error de validación');
  });

  it('maps Prisma P2002 to conflict with target', () => {
    const err = new Prisma.PrismaClientKnownRequestError('dup', {
      code: 'P2002',
      clientVersion: '5',
      meta: { target: ['email'] },
    } as any);
    const res = run(err);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json.mock.calls[0][0]).toMatchObject({ error: 'conflict', message: expect.stringContaining('email') });
  });

  it('maps Prisma P2002 with no target', () => {
    const err = new Prisma.PrismaClientKnownRequestError('dup', {
      code: 'P2002',
      clientVersion: '5',
    } as any);
    const res = run(err);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json.mock.calls[0][0].message).toBe('Registro duplicado: ');
  });

  it('maps Prisma P2025 to not found', () => {
    const err = new Prisma.PrismaClientKnownRequestError('missing', {
      code: 'P2025',
      clientVersion: '5',
    } as any);
    const res = run(err);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json.mock.calls[0][0].error).toBe('not_found');
  });

  it('handles PrismaClientValidationError', () => {
    const err = new Prisma.PrismaClientValidationError('bad', { clientVersion: '5' } as any);
    const res = run(err);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error).toBe('bad_request');
  });

  it('handles a ValidationError with details', () => {
    const err = new ValidationError('invalid', [{ field: 'x' }]);
    const res = run(err);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json.mock.calls[0][0]).toMatchObject({ error: 'validation_error', message: 'invalid', details: [{ field: 'x' }] });
  });

  it('handles a generic AppError', () => {
    const res = run(new Prisma.PrismaClientKnownRequestError('other', { code: 'P1000', clientVersion: '5' } as any));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0]).toMatchObject({ success: false, error: 'internal', message: 'Error interno del servidor', requestId: 'req-123' });
  });

  it('falls back to 500 for unknown errors and includes requestId', () => {
    const res = run(new Error('boom'));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0]).toMatchObject({ error: 'internal', requestId: 'req-123' });
  });
});
