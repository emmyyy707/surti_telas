import { describe, it, expect, vi } from 'vitest';
import { ListUsers } from '@/modules/auth/application/use-cases/ListUsers';
import {
  AssignPermissionToRole,
  CreatePermission,
  GetPermissions,
  GetRolePermissions,
  RemovePermissionFromRole,
} from '@/modules/auth/application/use-cases/ManagePermissions';
import { GetProfile, Logout } from '@/modules/auth/application/use-cases/ProfileUseCases';
import { NotFoundError } from '@/shared/domain/errors';

const userRecord = (overrides = {}) => ({
  id: 'u-1',
  email: 'a@b.com',
  nombre: 'Ana',
  telefono: null,
  role: 'ADMIN' as const,
  estado: 'ACTIVO' as const,
  passwordHash: 'hash',
  refreshToken: 'tok',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const repo = {
  listUsers: vi.fn(),
  findById: vi.fn(),
  updateRefreshToken: vi.fn(),
  findAllPermissions: vi.fn(),
  createPermission: vi.fn(),
  findRolePermissions: vi.fn(),
  assignPermissionToRole: vi.fn(),
  removePermissionFromRole: vi.fn(),
} as any;

describe('ListUsers', () => {
  it('strips sensitive fields from users', async () => {
    repo.listUsers.mockResolvedValue({ data: [userRecord()], meta: { total: 1, page: 1, limit: 50 } });
    const result = await new ListUsers(repo).execute();
    expect(result.data[0]).not.toHaveProperty('passwordHash');
    expect(result.data[0]).not.toHaveProperty('refreshToken');
    expect(result.data[0].email).toBe('a@b.com');
    expect(result.meta).toEqual({ total: 1, page: 1, limit: 50 });
  });

  it('forwards filters to the repository', async () => {
    repo.listUsers.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 50 } });
    await new ListUsers(repo).execute({ search: 'Ana', role: 'ADMIN' });
    expect(repo.listUsers).toHaveBeenCalledWith({ search: 'Ana', role: 'ADMIN' });
  });
});

describe('ManagePermissions', () => {
  it('GetPermissions lists all permissions', () => {
    repo.findAllPermissions.mockReturnValue([{ code: 'a:b' }]);
    expect(new GetPermissions(repo).execute()).toEqual([{ code: 'a:b' }]);
  });

  it('CreatePermission delegates to repo', () => {
    repo.createPermission.mockReturnValue({ code: 'a:b' });
    expect(new CreatePermission(repo).execute('a:b', 'd', 'm')).toEqual({ code: 'a:b' });
    expect(repo.createPermission).toHaveBeenCalledWith('a:b', 'd', 'm');
  });

  it('GetRolePermissions delegates to repo', () => {
    repo.findRolePermissions.mockReturnValue([{ permissionId: 'p1' }]);
    expect(new GetRolePermissions(repo).execute('ADMIN')).toEqual([{ permissionId: 'p1' }]);
  });

  it('AssignPermissionToRole delegates to repo', () => {
    new AssignPermissionToRole(repo).execute('ADMIN', 'p1');
    expect(repo.assignPermissionToRole).toHaveBeenCalledWith('ADMIN', 'p1');
  });

  it('RemovePermissionFromRole delegates to repo', () => {
    new RemovePermissionFromRole(repo).execute('ADMIN', 'p1');
    expect(repo.removePermissionFromRole).toHaveBeenCalledWith('ADMIN', 'p1');
  });
});

describe('ProfileUseCases', () => {
  it('GetProfile returns a public user', async () => {
    repo.findById.mockResolvedValue(userRecord());
    const profile = await new GetProfile(repo).execute('u-1');
    expect(profile.email).toBe('a@b.com');
    expect(profile).not.toHaveProperty('passwordHash');
  });

  it('GetProfile throws NotFound when user missing', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(new GetProfile(repo).execute('u-1')).rejects.toThrow(NotFoundError);
  });

  it('Logout clears the refresh token', async () => {
    await new Logout(repo).execute('u-1');
    expect(repo.updateRefreshToken).toHaveBeenCalledWith('u-1', null);
  });
});
