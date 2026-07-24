import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandler } from '@/shared/presentation/http/errorHandler';
import { AppError, NotFoundError, ForbiddenError, ValidationError, BadRequestError, TooManyRequestsError } from '@/shared/domain/errors';

const mockReq = {
  requestId: 'test-request-id',
  method: 'GET',
  url: '/test',
} as any;

const mockRes = () => {
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
};

describe('errorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle AppError with correct status and code', () => {
    const err = new NotFoundError('Not found');
    const res = mockRes();

    errorHandler(err, mockReq, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'not_found',
      message: 'Not found',
    });
  });

  it('should handle ForbiddenError', () => {
    const err = new ForbiddenError('Forbidden');
    const res = mockRes();

    errorHandler(err, mockReq, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'forbidden',
      message: 'Forbidden',
    });
  });

  it('should handle BadRequestError', () => {
    const err = new BadRequestError('Bad request');
    const res = mockRes();

    errorHandler(err, mockReq, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'bad_request',
      message: 'Bad request',
    });
  });

  it('should handle ValidationError with details', () => {
    const err = new ValidationError('Validation failed', { field: 'error' });
    const res = mockRes();

    errorHandler(err, mockReq, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'validation_error',
      message: 'Validation failed',
      details: { field: 'error' },
    });
  });

  it('should handle TooManyRequestsError', () => {
    const err = new TooManyRequestsError('Rate limit exceeded');
    const res = mockRes();

    errorHandler(err, mockReq, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'too_many_requests',
      message: 'Rate limit exceeded',
    });
  });

  it('should handle generic Error as 500', () => {
    const err = new Error('Something went wrong');
    const res = mockRes();

    errorHandler(err, mockReq, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'internal',
      message: 'Error interno del servidor',
      requestId: 'test-request-id',
    });
  });

  it('should include requestId in 500 responses', () => {
    const err = new Error('Unknown error');
    const res = mockRes();

    errorHandler(err, mockReq, res, vi.fn());

    const callArgs = (res.json as any).mock.calls[0][0];
    expect(callArgs).toHaveProperty('requestId', 'test-request-id');
  });
});
