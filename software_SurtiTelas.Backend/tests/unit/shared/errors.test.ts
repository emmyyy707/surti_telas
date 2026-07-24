import { describe, it, expect } from 'vitest';
import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
  ValidationError,
} from '@/shared/domain/errors';

describe('AppError hierarchy', () => {
  it('AppError carries status, code and details', () => {
    const err = new AppError('boom', 418, 'teapot', { foo: 1 });
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(418);
    expect(err.code).toBe('teapot');
    expect(err.details).toEqual({ foo: 1 });
    expect(err.name).toBe('AppError');
  });

  it('BadRequestError defaults to 400 bad_request', () => {
    const err = new BadRequestError();
    expect(err.status).toBe(400);
    expect(err.code).toBe('bad_request');
    expect(err.message).toBe('Solicitud inválida');
    expect(err).toBeInstanceOf(AppError);
  });

  it('BadRequestError keeps custom message and details', () => {
    const err = new BadRequestError('nope', { x: 1 });
    expect(err.message).toBe('nope');
    expect(err.details).toEqual({ x: 1 });
  });

  it('UnauthorizedError defaults to 401 unauthorized', () => {
    const err = new UnauthorizedError();
    expect(err.status).toBe(401);
    expect(err.code).toBe('unauthorized');
    expect(err.message).toBe('No autenticado');
  });

  it('ForbiddenError defaults to 403 forbidden', () => {
    const err = new ForbiddenError();
    expect(err.status).toBe(403);
    expect(err.code).toBe('forbidden');
  });

  it('NotFoundError defaults to 404 not_found', () => {
    const err = new NotFoundError();
    expect(err.status).toBe(404);
    expect(err.code).toBe('not_found');
  });

  it('ConflictError defaults to 409 conflict', () => {
    const err = new ConflictError('dup', { field: 'email' });
    expect(err.status).toBe(409);
    expect(err.code).toBe('conflict');
    expect(err.details).toEqual({ field: 'email' });
  });

  it('ValidationError defaults to 422 validation_error', () => {
    const err = new ValidationError();
    expect(err.status).toBe(422);
    expect(err.code).toBe('validation_error');
  });

  it('TooManyRequestsError defaults to 429 too_many_requests', () => {
    const err = new TooManyRequestsError();
    expect(err.status).toBe(429);
    expect(err.code).toBe('too_many_requests');
  });

  it('InternalError defaults to 500 internal', () => {
    const err = new InternalError();
    expect(err.status).toBe(500);
    expect(err.code).toBe('internal');
  });
});
