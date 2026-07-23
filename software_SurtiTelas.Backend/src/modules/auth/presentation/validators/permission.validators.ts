import { z } from 'zod';

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
