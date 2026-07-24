import { Role } from '@prisma/client';
import type { UserRecord } from '../entities/User';

export interface CreateUserInput {
  email: string;
  nombre: string;
  passwordHash: string;
  role: Role;
  telefono?: string;
  direccion?: string;
}

export interface PermissionData {
  id: string;
  code: string;
  description: string;
  module: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface RolePermissionData {
  role: Role;
  permissionId: string;
  permission: PermissionData;
}

export interface RoleData {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
  usuarios: number;
  estado: 'Activo' | 'Inactivo';
}

export interface UserFilters {
  search?: string;
  role?: Role;
  estado?: 'ACTIVO' | 'INACTIVO';
  page?: number;
  limit?: number;
  sort?: 'nombre' | 'email' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface AuthRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  create(input: CreateUserInput): Promise<UserRecord>;
  updateRefreshToken(id: string, token: string | null): Promise<void>;
  findPermissionsByRole(role: Role): Promise<string[]>;
  listUsers(filters?: UserFilters): Promise<{ data: UserRecord[]; meta: { total: number; page: number; limit: number; nextCursor?: string } }>;

  listPermissions(filters?: { page?: number; limit?: number }): Promise<{ data: PermissionData[]; meta: { total: number; page: number; limit: number; nextCursor?: string } }>;
  createPermission(code: string, description: string, module: string): Promise<PermissionData>;
  findPermissionById(id: string): Promise<PermissionData | null>;
  updatePermission(id: string, data: { code?: string; description?: string; module?: string }): Promise<PermissionData>;
  updatePermissionStatus(id: string, estado: 'ACTIVO' | 'INACTIVO'): Promise<PermissionData>;
  deletePermission(id: string): Promise<void>;
  listRolePermissions(role: Role, filters?: { page?: number; limit?: number }): Promise<{ data: RolePermissionData[]; meta: { total: number; page: number; limit: number; nextCursor?: string } }>;
  assignPermissionToRole(role: Role, permissionId: string): Promise<void>;
  removePermissionFromRole(role: Role, permissionId: string): Promise<void>;
  listRoles(filters?: { page?: number; limit?: number }): Promise<{ data: RoleData[]; meta: { total: number; page: number; limit: number; nextCursor?: string } }>;
  getRole(id: string): Promise<RoleData | null>;
  findRoleByName(name: string): Promise<RoleData | null>;
  createRole(name: string, description?: string): Promise<RoleData>;
  updateRole(name: string, description?: string): Promise<RoleData>;
  updateRoleStatus(name: string, estado: 'Activo' | 'Inactivo'): Promise<RoleData>;
  deleteRole(name: string): Promise<void>;
  delete(id: string): Promise<void>;

  updateTwoFactorSecret(id: string, secret: string | null): Promise<void>;
  enableTwoFactor(id: string, enabled: boolean): Promise<void>;

  setResetPasswordToken(id: string, token: string, expires: Date): Promise<void>;
  findByResetPasswordToken(token: string): Promise<UserRecord | null>;
  clearResetPasswordToken(id: string): Promise<void>;
  updatePassword(id: string, passwordHash: string): Promise<void>;

  updateProfile(id: string, data: { nombre?: string; telefono?: string | null }): Promise<UserRecord>;
  updateStatus(id: string, estado: 'ACTIVO' | 'INACTIVO'): Promise<UserRecord>;

  incrementFailedLoginAttempts(id: string): Promise<void>;
  resetFailedLoginAttempts(id: string): Promise<void>;
  lockUser(id: string, until: Date): Promise<void>;
  updateGoogleId(id: string, googleId: string): Promise<void>;
}
