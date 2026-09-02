import { api } from './httpClient';
import type { PaginatedResponse } from './pagination';

/** Roles tal como los devuelve el backend (String, incluye roles personalizados). */
export type BackendRole = string;

export interface BackendAuthUser {
  id: string;
  email: string;
  nombre: string;
  role: BackendRole;
  permissions?: string[];
  telefono?: string | null;
  direccion?: string | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  apellidos?: string | null;
  estado?: 'ACTIVO' | 'INACTIVO';
  avatar?: string | null;
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
  apellidos?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  role: BackendRole;
  estado: 'ACTIVO' | 'INACTIVO';
  createdAt: string;
  permissions?: string[];
  avatar?: string | null;
}

export interface UpdateProfileResponse {
  id: string;
  email: string;
  nombre: string;
  telefono?: string | null;
  direccion?: string | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  avatar?: string | null;
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
  apellidos?: string;
  role: BackendRole;
  telefono?: string;
  direccion?: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
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
  turnstileToken?: string;
}

export interface ForgotPasswordResponse {
  message: string;
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
  login: (email: string, password: string) => {
    return api.post<LoginResponse>('/auth/login', { email, password }, { auth: false }).then(r => {
      return r;
    }).catch(err => {
      throw err;
    });
  },

  googleLogin: (idToken: string) =>
    api.post<GoogleLoginResponse>('/auth/google', { idToken }, { auth: false }),

  me: () => api.get<ProfileResponse>('/auth/me'),

  updateProfile: (data: { nombre?: string; telefono?: string; email?: string; direccion?: string; tipoDocumento?: string; numeroDocumento?: string; password?: string; avatar?: string }) =>
    api.patch<UpdateProfileResponse>('/auth/me', data),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.postForm<UpdateProfileResponse>('/auth/me/avatar', form);
  },

  listUsers: (query?: Record<string, string | number | boolean | undefined | null>): Promise<UsersListResult> =>
    api.get<{ items: BackendAuthUser[]; meta: PaginatedResponse<BackendAuthUser>['data']['meta'] } | undefined>('/auth/users', { query }).then((response) => {
      const items = response?.items ?? [];
      const meta = response?.meta ?? { totalRecords: 0, page: 1, limit: 10, totalPages: 1 };
      return { data: items, meta };
    }),

  createUser: (data: CreateUserRequest) =>
    api.post<CreateUserResponse>('/auth/register', data),

  updateUser: (id: string, data: { nombre?: string; apellidos?: string; email?: string; telefono?: string | null; direccion?: string | null; tipoDocumento?: string | null; numeroDocumento?: string | null }) =>
    api.patch<BackendAuthUser>(`/auth/users/${encodeURIComponent(id)}`, data),

  deleteUser: (id: string) =>
    api.delete<void>(`/auth/users/${encodeURIComponent(id)}`),

  listPermissions: (query?: Record<string, string | number | boolean | undefined | null>) =>
    api.get<{ items: PermissionDTO[]; totalRecords: number; page: number; limit: number; totalPages: number; nextCursor: string | null } | undefined>('/auth/permissions', { query }).then((response) => {
      const items = response?.items ?? [];
      // El backend devuelve la paginación en la raíz (totalPages, page, limit, totalRecords),
      // no dentro de una clave "meta". Se pasa el objeto completo para que el consumidor
      // pueda leer meta.totalPages y cargar TODAS las páginas.
      return { data: items, meta: response ?? { totalRecords: 0, page: 1, limit: 10, totalPages: 1 } };
    }),

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
