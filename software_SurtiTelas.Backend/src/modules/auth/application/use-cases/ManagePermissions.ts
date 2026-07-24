import type { AuthRepository, PermissionData } from '../../domain/repositories/AuthRepository';
import { Role } from '@prisma/client';

export class GetPermissions {
  constructor(private readonly repo: AuthRepository) {}
  execute() {
    return this.repo.findAllPermissions();
  }
}

export class GetPermissionById {
  constructor(private readonly repo: AuthRepository) {}
  execute(id: string): Promise<PermissionData | null> {
    return this.repo.findPermissionById(id);
  }
}

export class CreatePermission {
  constructor(private readonly repo: AuthRepository) {}
  execute(code: string, description: string, module: string) {
    return this.repo.createPermission(code, description, module);
  }
}

export class UpdatePermission {
  constructor(private readonly repo: AuthRepository) {}
  execute(id: string, data: { code?: string; description?: string; module?: string }) {
    return this.repo.updatePermission(id, data);
  }
}

export class DeletePermission {
  constructor(private readonly repo: AuthRepository) {}
  execute(id: string) {
    return this.repo.deletePermission(id);
  }
}

export class UpdatePermissionStatus {
  constructor(private readonly repo: AuthRepository) {}
  execute(id: string, estado: 'ACTIVO' | 'INACTIVO') {
    return this.repo.updatePermissionStatus(id, estado);
  }
}

export class GetRolePermissions {
  constructor(private readonly repo: AuthRepository) {}
  execute(role: Role) {
    return this.repo.findRolePermissions(role);
  }
}

export class AssignPermissionToRole {
  constructor(private readonly repo: AuthRepository) {}
  execute(role: Role, permissionId: string) {
    return this.repo.assignPermissionToRole(role, permissionId);
  }
}

export class RemovePermissionFromRole {
  constructor(private readonly repo: AuthRepository) {}
  execute(role: Role, permissionId: string) {
    return this.repo.removePermissionFromRole(role, permissionId);
  }
}

export class ListRoles {
  constructor(private readonly repo: AuthRepository) {}
  execute() {
    return this.repo.listRoles();
  }
}

export class GetRole {
  constructor(private readonly repo: AuthRepository) {}
  execute(id: string) {
    return this.repo.getRole(id);
  }
}

export class CreateRole {
  constructor(private readonly repo: AuthRepository) {}
  execute(nombre: string, descripcion?: string) {
    return this.repo.createRole(nombre, descripcion);
  }
}

export class UpdateRole {
  constructor(private readonly repo: AuthRepository) {}
  execute(nombre: string, data: { nombre?: string; descripcion?: string }) {
    return this.repo.updateRole(data.nombre ?? nombre, data.descripcion);
  }
}

export class DeleteRole {
  constructor(private readonly repo: AuthRepository) {}
  execute(nombre: string) {
    const roleName = nombre.startsWith('R-') ? nombre.slice(2) : nombre;
    if (['ADMIN', 'ASESOR'].includes(roleName)) {
      throw new Error('No se puede eliminar un rol protegido');
    }
    return this.repo.deleteRole(nombre);
  }
}

export class UpdateRoleStatus {
  constructor(private readonly repo: AuthRepository) {}
  execute(nombre: string, estado: 'Activo' | 'Inactivo') {
    return this.repo.updateRoleStatus(nombre, estado);
  }
}
