import { describe, it, expect, vi } from 'vitest';
import { Request, Response } from 'express';
import { login, register, refresh, logout, me, listUsers, listPermissions, createPermission, listRolePermissions, assignPermissionToRole, removePermissionFromRole, enableTwoFactor, verifyTwoFactor, disableTwoFactor, forgotPassword, resetPassword, changePassword } from '@/modules/auth/presentation/controllers/auth.controller';

vi.mock('@/modules/auth/infrastructure/container/authContainer', () => ({
  authUseCases: {
    login: { execute: vi.fn() },
    register: { execute: vi.fn() },
    refresh: { execute: vi.fn() },
    logout: { execute: vi.fn() },
    getProfile: { execute: vi.fn() },
    listUsers: { execute: vi.fn() },
    getPermissions: { execute: vi.fn() },
    createPermission: { execute: vi.fn() },
    getRolePermissions: { execute: vi.fn() },
    assignPermissionToRole: { execute: vi.fn() },
    removePermissionFromRole: { execute: vi.fn() },
    enableTwoFactor: { execute: vi.fn() },
    verifyTwoFactor: { execute: vi.fn() },
    disableTwoFactor: { execute: vi.fn() },
    forgotPassword: { execute: vi.fn() },
    resetPassword: { execute: vi.fn() },
    changePassword: { execute: vi.fn() },
  },
}));

const mockReq = (overrides = {}) => ({
  user: { id: 'user-1', role: 'ADMIN', permissions: ['*'] },
  body: {},
  query: {},
  params: {},
  cookies: {},
  ...overrides,
}) as unknown as Request;
const mockRes = () => {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    cookie: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
  };
  return res as Response;
};

describe('auth.controller', () => {
  it('login should call use case and return ok', async () => {
    const req = mockReq({ body: { email: 'test@test.com', password: 'password' } });
    const res = mockRes();
    const { authUseCases } = await import('@/modules/auth/infrastructure/container/authContainer');
    (authUseCases.login.execute as any).mockResolvedValue({ accessToken: 'token', refreshToken: 'refresh', user: { id: '1' } });

    await login(req, res);

    expect(authUseCases.login.execute).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password' });
    expect(res.json).toHaveBeenCalled();
  });

  it('register should call use case with actor', async () => {
    const req = mockReq({ body: { nombre: 'Test', email: 'test@test.com', password: 'password', role: 'ADMIN' } });
    const res = mockRes();
    const { authUseCases } = await import('@/modules/auth/infrastructure/container/authContainer');
    (authUseCases.register.execute as any).mockResolvedValue({ id: '1', email: 'test@test.com' });

    await register(req, res);

    expect(authUseCases.register.execute).toHaveBeenCalledWith({ nombre: 'Test', email: 'test@test.com', password: 'password', role: 'ADMIN' });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('refresh should call refresh use case', async () => {
    const req = mockReq({ cookies: { refreshToken: 'refresh-token' } });
    const res = mockRes();
    const { authUseCases } = await import('@/modules/auth/infrastructure/container/authContainer');
    (authUseCases.refresh.execute as any).mockResolvedValue({ accessToken: 'new-token', refreshToken: 'refresh-token', user: { id: '1' } });

    await refresh(req, res);

    expect(authUseCases.refresh.execute).toHaveBeenCalledWith('refresh-token');
    expect(res.json).toHaveBeenCalled();
  });

  it('logout should call logout use case', async () => {
    const req = mockReq();
    const res = mockRes();
    const { authUseCases } = await import('@/modules/auth/infrastructure/container/authContainer');
    (authUseCases.logout.execute as any).mockResolvedValue(undefined);

    await logout(req, res);

    expect(authUseCases.logout.execute).toHaveBeenCalledWith('user-1');
    expect(res.json).toHaveBeenCalled();
  });

  it('me should return current user', async () => {
    const req = mockReq();
    const res = mockRes();
    const { authUseCases } = await import('@/modules/auth/infrastructure/container/authContainer');
    (authUseCases.getProfile.execute as any).mockResolvedValue({ id: 'user-1', email: 'test@test.com' });

    await me(req, res);

    expect(authUseCases.getProfile.execute).toHaveBeenCalledWith('user-1');
    expect(res.json).toHaveBeenCalled();
  });

  it('listUsers should return paginated users', async () => {
    const req = mockReq({ query: { page: 1, limit: 10 } });
    const res = mockRes();
    const { authUseCases } = await import('@/modules/auth/infrastructure/container/authContainer');
    (authUseCases.listUsers.execute as any).mockResolvedValue({ data: [{ id: '1' }], meta: { total: 1, page: 1, limit: 10 } });

    await listUsers(req, res);

    expect(authUseCases.listUsers.execute).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(res.json).toHaveBeenCalled();
  });

  it('listPermissions should return permissions', async () => {
    const req = mockReq();
    const res = mockRes();
    const { authUseCases } = await import('@/modules/auth/infrastructure/container/authContainer');
    (authUseCases.getPermissions.execute as any).mockResolvedValue([{ id: '1', code: 'catalog:read' }]);

    await listPermissions(req, res);

    expect(authUseCases.getPermissions.execute).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  it('createPermission should create permission', async () => {
    const req = mockReq({ body: { code: 'catalog:read', description: 'Read catalog', module: 'catalog' } });
    const res = mockRes();
    const { authUseCases } = await import('@/modules/auth/infrastructure/container/authContainer');
    (authUseCases.createPermission.execute as any).mockResolvedValue({ id: '1', code: 'catalog:read' });

    await createPermission(req, res);

    expect(authUseCases.createPermission.execute).toHaveBeenCalledWith('catalog:read', 'Read catalog', 'catalog');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('listRolePermissions should return role permissions', async () => {
    const req = mockReq({ params: { role: 'ADMIN' } });
    const res = mockRes();
    const { authUseCases } = await import('@/modules/auth/infrastructure/container/authContainer');
    (authUseCases.getRolePermissions.execute as any).mockResolvedValue([{ id: '1', code: 'catalog:read' }]);

    await listRolePermissions(req, res);

    expect(authUseCases.getRolePermissions.execute).toHaveBeenCalledWith('ADMIN');
    expect(res.json).toHaveBeenCalled();
  });

  it('assignPermissionToRole should assign permission', async () => {
    const req = mockReq({ params: { role: 'ADMIN' }, body: { permissionId: 'perm-1' } });
    const res = mockRes();
    const { authUseCases } = await import('@/modules/auth/infrastructure/container/authContainer');
    (authUseCases.assignPermissionToRole.execute as any).mockResolvedValue(undefined);

    await assignPermissionToRole(req, res);

    expect(authUseCases.assignPermissionToRole.execute).toHaveBeenCalledWith('ADMIN', 'perm-1');
    expect(res.json).toHaveBeenCalled();
  });

  it('removePermissionFromRole should remove permission', async () => {
    const req = mockReq({ params: { role: 'ADMIN' }, body: { permissionId: 'perm-1' } });
    const res = mockRes();
    const { authUseCases } = await import('@/modules/auth/infrastructure/container/authContainer');
    (authUseCases.removePermissionFromRole.execute as any).mockResolvedValue(undefined);

    await removePermissionFromRole(req, res);

    expect(authUseCases.removePermissionFromRole.execute).toHaveBeenCalledWith('ADMIN', 'perm-1');
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it('enableTwoFactor should call use case with user id', async () => {
    const req = mockReq();
    const res = mockRes();
    const { authUseCases } = await import('@/modules/auth/infrastructure/container/authContainer');
    (authUseCases.enableTwoFactor.execute as any).mockResolvedValue({ secret: 'secret', otpauthUrl: 'otpauth://...' });

    await enableTwoFactor(req, res);

    expect(authUseCases.enableTwoFactor.execute).toHaveBeenCalledWith('user-1');
    expect(res.json).toHaveBeenCalled();
  });

  it('verifyTwoFactor should call use case with tempToken and code', async () => {
    const req = mockReq({ body: { tempToken: 'temp-token', code: '123456' } });
    const res = mockRes();
    const { authUseCases } = await import('@/modules/auth/infrastructure/container/authContainer');
    (authUseCases.verifyTwoFactor.execute as any).mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh', user: { id: '1' } });

    await verifyTwoFactor(req, res);

    expect(authUseCases.verifyTwoFactor.execute).toHaveBeenCalledWith({ tempToken: 'temp-token', code: '123456' });
    expect(res.json).toHaveBeenCalled();
  });

  it('disableTwoFactor should call use case with user id', async () => {
    const req = mockReq();
    const res = mockRes();
    const { authUseCases } = await import('@/modules/auth/infrastructure/container/authContainer');
    (authUseCases.disableTwoFactor.execute as any).mockResolvedValue(undefined);

    await disableTwoFactor(req, res);

    expect(authUseCases.disableTwoFactor.execute).toHaveBeenCalledWith('user-1');
    expect(res.json).toHaveBeenCalled();
  });

  it('forgotPassword should call use case with email', async () => {
    const req = mockReq({ body: { email: 'test@test.com' } });
    const res = mockRes();
    const { authUseCases } = await import('@/modules/auth/infrastructure/container/authContainer');
    (authUseCases.forgotPassword.execute as any).mockResolvedValue({ message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña' });

    await forgotPassword(req, res);

    expect(authUseCases.forgotPassword.execute).toHaveBeenCalledWith('test@test.com');
    expect(res.json).toHaveBeenCalled();
  });

  it('resetPassword should call use case with token and newPassword', async () => {
    const req = mockReq({ body: { token: 'reset-token', newPassword: 'NewPass123!' } });
    const res = mockRes();
    const { authUseCases } = await import('@/modules/auth/infrastructure/container/authContainer');
    (authUseCases.resetPassword.execute as any).mockResolvedValue(undefined);

    await resetPassword(req, res);

    expect(authUseCases.resetPassword.execute).toHaveBeenCalledWith('reset-token', 'NewPass123!');
    expect(res.json).toHaveBeenCalled();
  });

  it('changePassword should call use case with user id and passwords', async () => {
    const req = mockReq({ body: { currentPassword: 'OldPass123!', newPassword: 'NewPass123!' } });
    const res = mockRes();
    const { authUseCases } = await import('@/modules/auth/infrastructure/container/authContainer');
    (authUseCases.changePassword.execute as any).mockResolvedValue(undefined);

    await changePassword(req, res);

    expect(authUseCases.changePassword.execute).toHaveBeenCalledWith('user-1', 'OldPass123!', 'NewPass123!');
    expect(res.json).toHaveBeenCalled();
  });
});
