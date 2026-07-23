import { describe, it, expect, vi } from 'vitest';
import { authenticate } from '@/modules/auth/presentation/middlewares/authenticate';
import { requirePermission, requireRole } from '@/modules/auth/presentation/middlewares/authorize';
import { UnauthorizedError, ForbiddenError } from '@/shared/domain/errors';

const { verifyAccessToken } = vi.hoisted(() => ({ verifyAccessToken: vi.fn() }));

vi.mock('@/modules/auth/infrastructure/container/authContainer', () => ({
  tokenService: { verifyAccessToken },
}));

const next = vi.fn();

describe('authenticate', () => {
  it('throws when authorization header is missing', () => {
    const req = { headers: {} } as any;
    expect(() => authenticate(req, {} as any, next)).toThrow(UnauthorizedError);
  });

  it('throws when header is not a Bearer token', () => {
    const req = { headers: { authorization: 'Basic abc' } } as any;
    expect(() => authenticate(req, {} as any, next)).toThrow(UnauthorizedError);
  });

  it('sets req.user and calls next for a valid token', () => {
    verifyAccessToken.mockReturnValue({ id: 'u-1', role: 'ADMIN', email: 'a@b.com', permissions: [] });
    const req = { headers: { authorization: 'Bearer abc.def' } } as any;

    authenticate(req, {} as any, next);

    expect(verifyAccessToken).toHaveBeenCalledWith('abc.def');
    expect(req.user).toMatchObject({ id: 'u-1', role: 'ADMIN' });
    expect(next).toHaveBeenCalled();
  });
});

describe('requireRole', () => {
  it('throws when there is no authenticated user', () => {
    const req = { user: undefined } as any;
    expect(() => requireRole('ADMIN')(req, {} as any, next)).toThrow(UnauthorizedError);
  });

  it('throws when the role is not allowed', () => {
    const req = { user: { role: 'CLIENTE' } } as any;
    expect(() => requireRole('ADMIN')(req, {} as any, next)).toThrow(ForbiddenError);
  });

  it('calls next when the role is allowed', () => {
    const req = { user: { role: 'ADMIN' } } as any;
    requireRole('ADMIN', 'ASESOR')(req, {} as any, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('requirePermission', () => {
  it('throws when there is no authenticated user', () => {
    const req = { user: undefined } as any;
    expect(() => requirePermission('orders:read')(req, {} as any, next)).toThrow(UnauthorizedError);
  });

  it('bypasses the check for ADMIN', () => {
    const req = { user: { role: 'ADMIN', permissions: [] } } as any;
    requirePermission('orders:read')(req, {} as any, next);
    expect(next).toHaveBeenCalled();
  });

  it('throws when the permission is missing', () => {
    const req = { user: { role: 'ASESOR', permissions: ['catalog:read'] } } as any;
    expect(() => requirePermission('orders:read')(req, {} as any, next)).toThrow(ForbiddenError);
  });

  it('calls next when the permission is present', () => {
    const req = { user: { role: 'ASESOR', permissions: ['orders:read'] } } as any;
    requirePermission('orders:read')(req, {} as any, next);
    expect(next).toHaveBeenCalled();
  });
});
