import { describe, it, expect, vi } from 'vitest';
import { errorHandler } from '@/shared/presentation/http/errorHandler';
import { BadRequestError, NotFoundError, ForbiddenError } from '@/shared/domain/errors';

describe('errorHandler', () => {
  it('should handle AppError with correct status and code', async () => {
    const req = {} as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();

    const error = new BadRequestError('Dato inválido');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'bad_request',
      message: 'Dato inválido',
    });
  });

  it('should handle NotFoundError', async () => {
    const req = {} as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();

    const error = new NotFoundError('Pedido no encontrado');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'not_found',
      message: 'Pedido no encontrado',
    });
  });

  it('should handle ForbiddenError', async () => {
    const req = {} as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();

    const error = new ForbiddenError('Rol no autorizado');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'forbidden',
      message: 'Rol no autorizado',
    });
  });

  it('should handle generic Error as 500', async () => {
    const req = { requestId: 'test-request-id' } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();

    const error = new Error('Unknown error');
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    const jsonCall = (res.json as any).mock.calls[0]?.[0];
    expect(jsonCall).toBeDefined();
    expect(jsonCall.success).toBe(false);
    expect(jsonCall.error).toBe('internal');
    expect(jsonCall.message).toBe('Error interno del servidor');

    process.env.NODE_ENV = prevEnv;
  });
});
