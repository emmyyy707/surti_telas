import { z } from 'zod';
import { PaginationSchema } from '../../../../shared/presentation/validators';

export const CreatePermissionSchema = z.object({
  code: z.string().min(1, 'El código es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  module: z.string().min(1, 'El módulo es obligatorio'),
});

export const AssignPermissionSchema = z.object({
  permissionId: z.string().min(1, 'permissionId es obligatorio'),
});

export const UpdatePermissionStatusSchema = z.object({
  estado: z.enum(['ACTIVO', 'INACTIVO']),
});

export const PermissionFiltersSchema = z.object({
  ...PaginationSchema.shape,
});

export const RolePermissionFiltersSchema = z.object({
  ...PaginationSchema.shape,
});

export const RoleFiltersSchema = z.object({
  ...PaginationSchema.shape,
});

export const CreateRoleSchema = z.object({
  nombre: z.string().min(1, 'El nombre del rol es obligatorio'),
  descripcion: z.string().optional(),
  permisos: z.array(z.string()).optional(),
});

export const UpdateRoleSchema = z.object({
  nombre: z.string().min(1, 'El nombre del rol es obligatorio').optional(),
  descripcion: z.string().optional(),
  permisos: z.array(z.string()).optional(),
});
