import { api } from './httpClient';
import type { PaginatedResponse } from './pagination';

/** Roles tal como los devuelve el backend (enum Prisma). */
export type BackendRole = 'ADMIN' | 'ASESOR' | 'DOMICILIARIO' | 'CLIENTE' | 'ALMACEN' | 'PRODUCCION' | 'REPORTES';

export interface BackendAuthUser {
  id: string;
  email: string;
  nombre: string;
  role: BackendRole;
  permissions?: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: BackendAuthUser;
}

export interface ProfileResponse {
  id: string;
  email: string;
  nombre: string;
  telefono?: string | null;
  direccion?: string | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  role: BackendRole;
  estado: 'ACTIVO' | 'INACTIVO';
  createdAt: string;
  permissions?: string[];
}

export interface UpdateProfileResponse {
  id: string;
  email: string;
  nombre: string;
  telefono?: string | null;
  direccion?: string | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  role: BackendRole;
  estado: 'ACTIVO' | 'INACTIVO';
  createdAt: string;
}

export interface PermissionDTO {
  id: string;
  code: string;
  description: string;
  module: string;
  estado?: 'ACTIVO' | 'INACTIVO';
}

export interface CreateUserRequest {
  email: string;
  password: string;
  nombre: string;
  role: BackendRole;
  telefono?: string;
  direccion?: string;
}

export interface CreateUserResponse {
  id: string;
  email: string;
  nombre: string;
  role: BackendRole;
}

export interface GoogleLoginResponse {
  accessToken: string;
  user: BackendAuthUser;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetUrl?: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface UsersListResult {
  data: BackendAuthUser[];
  meta: PaginatedResponse<BackendAuthUser>['data']['meta'];
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email, password }, { auth: false }),

  googleLogin: (idToken: string) =>
    api.post<GoogleLoginResponse>('/auth/google', { idToken }, { auth: false }),

  me: () => api.get<ProfileResponse>('/auth/me'),

  updateProfile: (data: { nombre?: string; telefono?: string; email?: string; direccion?: string; tipoDocumento?: string; numeroDocumento?: string; password?: string }) =>
    api.patch<UpdateProfileResponse>('/auth/me', data),

  listUsers: (query?: Record<string, string | number | boolean | undefined | null>): Promise<UsersListResult> =>
    api.get<{ items: BackendAuthUser[]; meta: PaginatedResponse<BackendAuthUser>['data']['meta'] }>('/auth/users', { query }).then((response) => ({
      data: response.items,
      meta: response.meta,
    })),

  createUser: (data: CreateUserRequest) =>
    api.post<CreateUserResponse>('/auth/register', data),

  updateUser: (id: string, data: { nombre?: string; telefono?: string | null }) =>
    api.patch<BackendAuthUser>(`/auth/users/${encodeURIComponent(id)}`, data),

  deleteUser: (id: string) =>
    api.delete<void>(`/auth/users/${encodeURIComponent(id)}`),

  listPermissions: () =>
    api.get<PermissionDTO[]>('/auth/permissions'),

  createPermission: (data: { code: string; description?: string; module?: string }) =>
    api.post<PermissionDTO & { id: string }>('/auth/permissions', data),

  updatePermission: (id: string, data: { code?: string; description?: string; module?: string }) =>
    api.patch<PermissionDTO & { id: string }>(`/auth/permissions/${encodeURIComponent(id)}`, data),

  updatePermissionStatus: (id: string, estado: 'ACTIVO' | 'INACTIVO') =>
    api.patch<PermissionDTO & { id: string }>(`/auth/permissions/${encodeURIComponent(id)}/status`, { estado }),

  deletePermission: (id: string) =>
    api.delete<void>(`/auth/permissions/${encodeURIComponent(id)}`),

  logout: () => api.post<null>('/auth/logout'),

  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post<ForgotPasswordResponse>('/auth/forgot-password', data, { auth: false }),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post<ForgotPasswordResponse>('/auth/reset-password', data, { auth: false }),
};
