import { Request, Response } from 'express';
import { created, noContent, ok } from '../../../../shared/presentation/http/HttpResponse';
import { buildApiPaginatedResponse } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { authUseCases } from '../../infrastructure/container/authContainer';
import { LoginSchema, RegisterSchema, UserFiltersSchema, VerifyTwoFactorSchema, ForgotPasswordSchema, ResetPasswordSchema, ChangePasswordSchema, UpdateProfileSchema, GoogleTokenSchema, CreateUserSchema, UpdateUserStatusSchema, UpdateRoleStatusSchema } from '../validators/auth.validators';
import { AssignPermissionSchema, CreatePermissionSchema, PermissionFiltersSchema, RolePermissionFiltersSchema, RoleFiltersSchema, UpdatePermissionStatusSchema } from '../validators/permission.validators';
import { ConflictError, UnauthorizedError } from '../../../../shared/domain/errors';
import { eventBus } from '../../../../shared/infrastructure/eventBus';
import {
  AuthLoginEvent,
  AuthLoginFailedEvent,
  AuthLogoutEvent,
  UserCreatedEvent,
  UserUpdatedEvent,
  UserDeletedEvent,
} from '../../../../shared/application/events';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/v1/auth';

function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'none',
    path: REFRESH_COOKIE_PATH,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = parseDto(LoginSchema, req.body);
  try {
    const result = await authUseCases.login.execute({ email, password });
    if ('requiresTwoFactor' in result && result.requiresTwoFactor) {
      eventBus.publish(
        new AuthLoginFailedEvent({
          email,
          reason: '2FA_required',
          ip: req.ip,
          userAgent: req.get('user-agent'),
        }),
        req.requestId
      );
      return ok(res, { requiresTwoFactor: true, tempToken: result.tempToken, user: result.user }, 'Se requiere 2FA');
    }
    const authResult = result as { accessToken: string; refreshToken: string; user: typeof result.user };
    setRefreshTokenCookie(res, authResult.refreshToken);
    eventBus.publish(
      new AuthLoginEvent({
        userId: authResult.user.id,
        email: authResult.user.email,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      }),
      req.requestId
    );
    return ok(res, { accessToken: authResult.accessToken, user: authResult.user }, 'Sesión iniciada');
  } catch (error) {
    eventBus.publish(
      new AuthLoginFailedEvent({
        email,
        reason: error instanceof Error ? error.message : 'unknown',
        ip: req.ip,
        userAgent: req.get('user-agent'),
      }),
      req.requestId
    );
    throw error;
  }
};

export const register = async (req: Request, res: Response) => {
  const input = parseDto(RegisterSchema, req.body);
  const result = await authUseCases.register.execute(input);
  setRefreshTokenCookie(res, result.refreshToken);
  eventBus.publish(
    new UserCreatedEvent({
      userId: result.user.id,
      nombre: result.user.nombre,
      email: result.user.email,
      role: result.user.role,
    }),
    req.requestId
  );
  return created(res, { accessToken: result.accessToken, user: result.user }, 'Usuario registrado');
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw new UnauthorizedError('No hay sesión activa');
  }
  const result = await authUseCases.refresh.execute(refreshToken);
  setRefreshTokenCookie(res, result.refreshToken);
  return ok(res, { accessToken: result.accessToken, user: result.user });
};

export const logout = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await authUseCases.logout.execute(userId);
  res.clearCookie(REFRESH_COOKIE_NAME, { httpOnly: true, sameSite: 'none', path: REFRESH_COOKIE_PATH });
  eventBus.publish(
    new AuthLogoutEvent({ userId, email: req.user!.email }),
    req.requestId
  );
  return ok(res, null, 'Sesión cerrada');
};

export const google = async (req: Request, res: Response) => {
  const { idToken } = parseDto(GoogleTokenSchema, req.body);
  const result = await authUseCases.google.execute(idToken);
  setRefreshTokenCookie(res, result.refreshToken);
  return ok(res, { accessToken: result.accessToken, user: result.user }, 'Autenticado con Google');
};

export const me = async (req: Request, res: Response) => {
  const user = await authUseCases.getProfile.execute(req.user!.id);
  return ok(res, user);
};

export const updateProfile = async (req: Request, res: Response) => {
  const { nombre, telefono } = parseDto(UpdateProfileSchema, req.body);
  const user = await authUseCases.updateProfile.execute(req.user!.id, { nombre, telefono });
  eventBus.publish(
    new UserUpdatedEvent({
      userId: user.id,
      nombre: user.nombre,
      cambios: { nombre, telefono },
    }),
    req.requestId
  );
  return ok(res, user, 'Perfil actualizado');
};

export const listUsers = async (req: Request, res: Response) => {
  const filters = parseDto(UserFiltersSchema, req.query);
  const result = await authUseCases.listUsers.execute(filters);
  const response = buildApiPaginatedResponse(
    result.data,
    result.meta.total,
    result.meta.page || 1,
    result.meta.limit,
    result.meta.nextCursor
  );
  return ok(res, response);
};

export const listPermissions = async (req: Request, res: Response) => {
  const filters = parseDto(PermissionFiltersSchema, req.query);
  const result = await authUseCases.listPermissions.execute(filters);
  const response = buildApiPaginatedResponse(
    result.data,
    result.meta.total,
    result.meta.page,
    result.meta.limit,
    result.meta.nextCursor
  );
  return ok(res, response);
};

export const getPermission = async (req: Request, res: Response) => {
  const permission = await authUseCases.getPermissionById.execute(req.params.id);
  if (!permission) {
    return res.status(404).json({ success: false, error: 'not_found', message: 'Permiso no encontrado' });
  }
  return ok(res, permission);
};

export const createPermission = async (req: Request, res: Response) => {
  const input = parseDto(CreatePermissionSchema, req.body);
  const permission = await authUseCases.createPermission.execute(input.code, input.description, input.module);
  return created(res, permission, 'Permiso creado');
};

export const updatePermission = async (req: Request, res: Response) => {
  const permission = await authUseCases.updatePermission.execute(req.params.id, req.body);
  return ok(res, permission, 'Permiso actualizado');
};

export const deletePermission = async (req: Request, res: Response) => {
  await authUseCases.deletePermission.execute(req.params.id);
  return noContent(res);
};

export const listRolePermissions = async (req: Request, res: Response) => {
  const role = req.params.role as 'ADMIN' | 'ASESOR' | 'DOMICILIARIO' | 'CLIENTE';
  const filters = parseDto(RolePermissionFiltersSchema, req.query);
  const result = await authUseCases.listRolePermissions.execute(role, filters);
  const response = buildApiPaginatedResponse(
    result.data,
    result.meta.total,
    result.meta.page,
    result.meta.limit,
    result.meta.nextCursor
  );
  return ok(res, response);
};

export const assignPermissionToRole = async (req: Request, res: Response) => {
  const role = req.params.role as 'ADMIN' | 'ASESOR' | 'DOMICILIARIO' | 'CLIENTE';
  const { permissionId } = parseDto(AssignPermissionSchema, req.body);
  await authUseCases.assignPermissionToRole.execute(role, permissionId);
  return ok(res, null, 'Permiso asignado al rol');
};

export const removePermissionFromRole = async (req: Request, res: Response) => {
  const role = req.params.role as 'ADMIN' | 'ASESOR' | 'DOMICILIARIO' | 'CLIENTE';
  const { permissionId } = parseDto(AssignPermissionSchema, req.body);
  await authUseCases.removePermissionFromRole.execute(role, permissionId);
  return noContent(res);
};

export const listRoles = async (req: Request, res: Response) => {
  const filters = parseDto(RoleFiltersSchema, req.query);
  const result = await authUseCases.listRoles.execute(filters);
  const response = buildApiPaginatedResponse(
    result.data,
    result.meta.total,
    result.meta.page,
    result.meta.limit,
    result.meta.nextCursor
  );
  return ok(res, response);
};

export const getRole = async (req: Request, res: Response) => {
  const role = await authUseCases.getRole.execute(req.params.id);
  if (!role) {
    return res.status(404).json({ success: false, error: 'not_found', message: 'Rol no encontrado' });
  }
  return ok(res, role);
};

export const createRole = async (req: Request, res: Response) => {
  const { nombre, descripcion } = req.body as { nombre: string; descripcion?: string };
  const role = await authUseCases.createRole.execute(nombre, descripcion);
  return created(res, role, 'Rol creado');
};

export const updateRole = async (req: Request, res: Response) => {
  const { nombre, descripcion } = req.body as { nombre?: string; descripcion?: string };
  const role = await authUseCases.updateRole.execute(req.params.id, { nombre, descripcion });
  return ok(res, role, 'Rol actualizado');
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    await authUseCases.deleteRole.execute(req.params.id);
    return noContent(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo eliminar el rol';
    const status = message.toLowerCase().includes('protegido') ? 409 : 400;
    return res.status(status).json({ success: false, error: 'conflict', message });
  }
};

export const enableTwoFactor = async (req: Request, res: Response) => {
  const result = await authUseCases.enableTwoFactor.execute(req.user!.id);
  return ok(res, result, '2FA habilitado');
};

export const verifyTwoFactor = async (req: Request, res: Response) => {
  const { tempToken, code } = parseDto(VerifyTwoFactorSchema, req.body);
  const result = await authUseCases.verifyTwoFactor.execute({ tempToken, code });
  return ok(res, result, 'Sesión iniciada');
};

export const disableTwoFactor = async (req: Request, res: Response) => {
  await authUseCases.disableTwoFactor.execute(req.user!.id);
  return ok(res, null, '2FA deshabilitado');
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = parseDto(ForgotPasswordSchema, req.body);
  const result = await authUseCases.forgotPassword.execute(email);
  return ok(res, result, result.message);
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = parseDto(ResetPasswordSchema, req.body);
  await authUseCases.resetPassword.execute(token, newPassword);
  return ok(res, null, 'Contraseña restablecida correctamente');
};

export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = parseDto(ChangePasswordSchema, req.body);
  await authUseCases.changePassword.execute(req.user!.id, currentPassword, newPassword);
  return ok(res, null, 'Contraseña actualizada correctamente');
};

export const createUser = async (req: Request, res: Response) => {
  const input = parseDto(CreateUserSchema, req.body);
  const result = await authUseCases.register.execute(input);
  return created(res, { id: result.user.id, email: result.user.email, nombre: result.user.nombre, role: result.user.role }, 'Usuario creado');
};

export const updateUserStatus = async (req: Request, res: Response) => {
  const { estado } = parseDto(UpdateUserStatusSchema, req.body);
  const user = await authUseCases.updateUserStatus.execute(req.params.id, estado);
  eventBus.publish(
    new UserUpdatedEvent({
      userId: user.id,
      nombre: user.nombre,
      cambios: { estado },
    }),
    req.requestId
  );
  return ok(res, user, estado === 'ACTIVO' ? 'Usuario activado' : 'Usuario desactivado');
};

export const updateUser = async (req: Request, res: Response) => {
  const { nombre, telefono } = req.body as { nombre?: string; telefono?: string | null };
  const user = await authUseCases.updateProfile.execute(req.params.id, { nombre, telefono });
  return ok(res, user, 'Usuario actualizado');
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const user = await authUseCases.getProfile.execute(id);
    await authUseCases.deleteUser.execute(id);
    eventBus.publish(
      new UserDeletedEvent({
        userId: id,
        nombre: user.nombre,
      }),
      req.requestId
    );
    return noContent(res);
  } catch (error) {
    if (error instanceof ConflictError) {
      return res.status(409).json({ success: false, error: 'conflict', message: error.message });
    }
    throw error;
  }
};

export const updatePermissionStatus = async (req: Request, res: Response) => {
  const { estado } = parseDto(UpdatePermissionStatusSchema, req.body);
  const permission = await authUseCases.updatePermissionStatus.execute(req.params.id, estado);
  return ok(res, permission, estado === 'ACTIVO' ? 'Permiso activado' : 'Permiso desactivado');
};

export const updateRoleStatus = async (req: Request, res: Response) => {
  const { estado } = parseDto(UpdateRoleStatusSchema, req.body);
  const role = await authUseCases.updateRoleStatus.execute(req.params.id, estado);
  return ok(res, role, estado === 'Activo' ? 'Rol activado' : 'Rol desactivado');
};
