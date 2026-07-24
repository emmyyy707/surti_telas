import { Prisma, PrismaClient, Role } from '@prisma/client';
import { NotFoundError } from '../../../../shared/domain/errors';
import type { AuthRepository, CreateUserInput, PermissionData, RolePermissionData, RoleData } from '../../domain/repositories/AuthRepository';
import type { UserRecord } from '../../domain/entities/User';

const toRecord = (u: {
  id: string;
  email: string;
  passwordHash: string;
  nombre: string;
  telefono?: string | null;
  direccion?: string | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  role: Role;
  estado: 'ACTIVO' | 'INACTIVO';
  refreshToken?: string | null;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  failedLoginAttempts?: number;
  lockedUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): UserRecord => ({
  id: u.id,
  email: u.email,
  nombre: u.nombre,
  telefono: u.telefono,
  direccion: u.direccion,
  tipoDocumento: u.tipoDocumento,
  numeroDocumento: u.numeroDocumento,
  role: u.role,
  estado: u.estado,
  passwordHash: u.passwordHash,
  refreshToken: u.refreshToken,
  twoFactorEnabled: u.twoFactorEnabled,
  twoFactorSecret: u.twoFactorSecret,
  resetPasswordToken: u.resetPasswordToken,
  resetPasswordExpires: u.resetPasswordExpires,
  failedLoginAttempts: u.failedLoginAttempts,
  lockedUntil: u.lockedUntil,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt != null) return null;
    return toRecord(user);
  }

  async findById(id: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) return null;
    const permissions = await this.findPermissionsByRole(user.role);
    return { ...toRecord(user), permissions };
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        nombre: input.nombre,
        passwordHash: input.passwordHash,
        role: input.role,
        telefono: input.telefono,
        direccion: input.direccion,
        tipoDocumento: input.tipoDocumento,
        numeroDocumento: input.numeroDocumento,
      },
    });
    return toRecord(user);
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { refreshToken: token } });
  }

  async updateStatus(id: string, estado: 'ACTIVO' | 'INACTIVO'): Promise<UserRecord> {
    const user = await this.prisma.user.update({ where: { id }, data: { estado } });
    return toRecord(user);
  }

  async updateProfile(id: string, data: { nombre?: string; telefono?: string | null; direccion?: string | null; tipoDocumento?: string | null; numeroDocumento?: string | null }): Promise<UserRecord> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        nombre: data.nombre,
        telefono: data.telefono,
        direccion: data.direccion,
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
      },
    });
    return toRecord(user);
  }

  async findPermissionsByRole(role: Role): Promise<string[]> {
    const rows = await this.prisma.rolePermission.findMany({
      where: { role },
      include: { permission: true },
    });
    return rows.map((r) => r.permission.code);
  }

  async listUsers(filters: {
    search?: string;
    role?: Role;
    estado?: 'ACTIVO' | 'INACTIVO';
    page?: number;
    limit?: number;
    sort?: 'nombre' | 'email' | 'createdAt';
    order?: 'asc' | 'desc';
  } = {}): Promise<{ data: UserRecord[]; meta: { total: number; page: number; limit: number } }> {
    const where: Prisma.UserWhereInput = { deletedAt: null };
    if (filters.search) {
      where.OR = [
        { nombre: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.role) where.role = filters.role;
    if (filters.estado) where.estado = filters.estado;

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const sort = filters.sort ?? 'createdAt';
    const order = filters.order ?? 'desc';

    const orderBy: Record<string, 'asc' | 'desc'> = { [sort]: order };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: orderBy as Prisma.UserOrderByWithRelationInput,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: rows.map(toRecord),
      meta: { total, page, limit },
    };
  }

  async listPermissions(filters?: { page?: number; limit?: number }): Promise<{ data: PermissionData[]; meta: { total: number; page: number; limit: number; nextCursor?: string } }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 50;
    const [permissions, total] = await this.prisma.$transaction([
      this.prisma.permission.findMany({ orderBy: { module: 'asc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.permission.count(),
    ]);
    return {
      data: permissions.map((p) => ({
        id: p.id,
        code: p.code,
        description: p.description,
        module: p.module,
        estado: p.estado as 'ACTIVO' | 'INACTIVO',
      })),
      meta: { total, page, limit },
    };
  }

  async createPermission(code: string, description: string, module: string): Promise<PermissionData> {
    const permission = await this.prisma.permission.create({
      data: { code, description, module },
    });
    return {
      id: permission.id,
      code: permission.code,
      description: permission.description,
      module: permission.module,
      estado: permission.estado as 'ACTIVO' | 'INACTIVO',
    };
  }

  async updatePermission(id: string, data: { code?: string; description?: string; module?: string }): Promise<PermissionData> {
    const permission = await this.prisma.permission.update({
      where: { id },
      data,
    });
    return {
      id: permission.id,
      code: permission.code,
      description: permission.description,
      module: permission.module,
      estado: permission.estado as 'ACTIVO' | 'INACTIVO',
    };
  }

  async updatePermissionStatus(id: string, estado: 'ACTIVO' | 'INACTIVO'): Promise<PermissionData> {
    const permission = await this.prisma.permission.update({
      where: { id },
      data: { estado },
    });
    return {
      id: permission.id,
      code: permission.code,
      description: permission.description,
      module: permission.module,
      estado: permission.estado as 'ACTIVO' | 'INACTIVO',
    };
  }

  async deletePermission(id: string): Promise<void> {
    await this.prisma.permission.delete({ where: { id } });
  }

  async findPermissionById(id: string): Promise<PermissionData | null> {
    const permission = await this.prisma.permission.findUnique({ where: { id } });
    if (!permission) return null;
    return { id: permission.id, code: permission.code, description: permission.description, module: permission.module, estado: permission.estado as 'ACTIVO' | 'INACTIVO' };
  }

  async listRolePermissions(role: Role, filters?: { page?: number; limit?: number }): Promise<{ data: RolePermissionData[]; meta: { total: number; page: number; limit: number; nextCursor?: string } }> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 50;
    const where: Prisma.RolePermissionWhereInput = { role };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.rolePermission.findMany({ where, include: { permission: true }, skip: (page - 1) * limit, take: limit }),
      this.prisma.rolePermission.count({ where }),
    ]);
    return {
      data: rows.map((r) => ({
        role,
        permissionId: r.permissionId,
        permission: {
          id: r.permission.id,
          code: r.permission.code,
          description: r.permission.description,
          module: r.permission.module,
          estado: r.permission.estado as 'ACTIVO' | 'INACTIVO',
        },
      })),
      meta: { total, page, limit },
    };
  }

  async assignPermissionToRole(role: Role, permissionId: string): Promise<void> {
    await this.prisma.rolePermission.create({
      data: { role, permissionId },
    });
  }

  async removePermissionFromRole(role: Role, permissionId: string): Promise<void> {
    await this.prisma.rolePermission.delete({
      where: { role_permissionId: { role, permissionId } },
    });
  }

  async listRoles(filters?: { page?: number; limit?: number }): Promise<{ data: RoleData[]; meta: { total: number; page: number; limit: number; nextCursor?: string } }> {
    const roles = Object.values(Role);
    const counts = await this.prisma.user.groupBy({
      by: ['role'],
      where: { deletedAt: null },
      _count: { role: true },
    });

    const countMap = new Map<string, number>();
    for (const row of counts) {
      countMap.set(row.role, row._count.role);
    }

    const roleConfigs = await this.prisma.roleConfig.findMany({
      where: { role: { in: roles } },
    });
    const estadoMap = new Map<string, 'Activo' | 'Inactivo'>();
    const descripcionMap = new Map<string, string>();
    const defaultDescriptions: Record<string, string> = {
      ADMIN: 'Administrador del sistema',
      ASESOR: 'Asesor de ventas',
      DOMICILIARIO: 'Domiciliario',
      CLIENTE: 'Cliente',
      ALMACEN: 'Almacén',
      PRODUCCION: 'Producción',
      REPORTES: 'Reportes',
    };
    for (const rc of roleConfigs) {
      estadoMap.set(rc.role, rc.estado === 'ACTIVO' ? 'Activo' : 'Inactivo');
      if (rc.descripcion) descripcionMap.set(rc.role, rc.descripcion);
    }

    const allRoles = roles.map((name) => ({
      id: `R-${name}`,
      nombre: name,
      descripcion: descripcionMap.get(name) ?? defaultDescriptions[name] ?? name,
      permisos: [],
      usuarios: countMap.get(name) ?? 0,
      estado: estadoMap.get(name) ?? 'Activo',
    }));

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 50;
    const total = allRoles.length;
    const start = (page - 1) * limit;
    const paginated = allRoles.slice(start, start + limit);

    return { data: paginated, meta: { total, page, limit } };
  }

  async getRole(id: string): Promise<RoleData | null> {
    const roleName = id.startsWith('R-') ? id.slice(2) : id;
    const values = Object.values(Role) as Role[];
    if (!values.includes(roleName as Role)) return null;

    const counts = await this.prisma.user.groupBy({
      by: ['role'],
      where: { role: roleName as Role, deletedAt: null },
      _count: { role: true },
    });
    const usuarios = counts[0]?._count.role ?? 0;

    const roleConfig = await this.prisma.roleConfig.findUnique({
      where: { role: roleName as Role },
    });
    const defaultDescriptions: Record<string, string> = {
      ADMIN: 'Administrador del sistema',
      ASESOR: 'Asesor de ventas',
      DOMICILIARIO: 'Domiciliario',
      CLIENTE: 'Cliente',
      ALMACEN: 'Almacén',
      PRODUCCION: 'Producción',
      REPORTES: 'Reportes',
    };
    const estado = roleConfig ? (roleConfig.estado === 'ACTIVO' ? 'Activo' : 'Inactivo') : 'Activo';

    return {
      id: `R-${roleName}`,
      nombre: roleName,
      descripcion: roleConfig?.descripcion ?? defaultDescriptions[roleName] ?? roleName,
      permisos: [],
      usuarios,
      estado,
    };
  }

  async findRoleByName(name: string): Promise<RoleData | null> {
    const roleName = name.startsWith('R-') ? name.slice(2) : name;
    const values = Object.values(Role) as Role[];
    if (!values.includes(roleName as Role)) return null;
    
    const roleConfig = await this.prisma.roleConfig.findUnique({
      where: { role: roleName as Role },
    });
    
    const count = await this.prisma.user.count({ where: { role: roleName as Role, deletedAt: null } });
    const defaultDescriptions: Record<string, string> = {
      ADMIN: 'Administrador del sistema',
      ASESOR: 'Asesor de ventas',
      DOMICILIARIO: 'Domiciliario',
      CLIENTE: 'Cliente',
      ALMACEN: 'Almacén',
      PRODUCCION: 'Producción',
      REPORTES: 'Reportes',
    };
    return {
      id: `R-${roleName}`,
      nombre: roleName,
      descripcion: roleConfig?.descripcion ?? defaultDescriptions[roleName] ?? roleName,
      permisos: [],
      usuarios: count,
      estado: roleConfig?.estado === 'INACTIVO' ? 'Inactivo' : 'Activo',
    };
  }

  async createRole(nombre: string, descripcion?: string): Promise<RoleData> {
    const roleName = nombre.startsWith('R-') ? nombre.slice(2) : nombre;
    const values = Object.values(Role) as Role[];
    if (!values.includes(roleName as Role)) {
      throw new NotFoundError(`Rol "${roleName}" no existe. Los roles válidos son: ${values.join(', ')}`);
    }
    const defaultDescriptions: Record<string, string> = {
      ADMIN: 'Administrador del sistema',
      ASESOR: 'Asesor de ventas',
      DOMICILIARIO: 'Domiciliario',
      CLIENTE: 'Cliente',
      ALMACEN: 'Almacén',
      PRODUCCION: 'Producción',
      REPORTES: 'Reportes',
    };
    const roleConfig = await this.prisma.roleConfig.upsert({
      where: { role: roleName as Role },
      update: { descripcion: descripcion ?? defaultDescriptions[roleName] ?? roleName },
      create: { role: roleName as Role, estado: 'ACTIVO', descripcion: descripcion ?? defaultDescriptions[roleName] ?? roleName },
    });
    const count = await this.prisma.user.count({ where: { role: roleName as Role, deletedAt: null } });
    return {
      id: `R-${roleName}`,
      nombre: roleName,
      descripcion: roleConfig.descripcion ?? defaultDescriptions[roleName] ?? roleName,
      permisos: [],
      usuarios: count,
      estado: roleConfig.estado === 'INACTIVO' ? 'Inactivo' : 'Activo',
    };
  }

  async updateRole(nombre: string, descripcion?: string): Promise<RoleData> {
    const roleName = nombre.startsWith('R-') ? nombre.slice(2) : nombre;
    const values = Object.values(Role) as Role[];
    if (!values.includes(roleName as Role)) {
      throw new NotFoundError(`Rol "${roleName}" no existe. Los roles válidos son: ${values.join(', ')}`);
    }
    const found = await this.findRoleByName(roleName);
    if (!found) throw new NotFoundError('Rol no encontrado');
    const updated = await this.prisma.roleConfig.update({
      where: { role: roleName as Role },
      data: { descripcion: descripcion ?? found.descripcion },
    });
    const count = await this.prisma.user.count({ where: { role: roleName as Role, deletedAt: null } });
    const defaultDescriptions: Record<string, string> = {
      ADMIN: 'Administrador del sistema',
      ASESOR: 'Asesor de ventas',
      DOMICILIARIO: 'Domiciliario',
      CLIENTE: 'Cliente',
      ALMACEN: 'Almacén',
      PRODUCCION: 'Producción',
      REPORTES: 'Reportes',
    };
    return {
      id: `R-${roleName}`,
      nombre: roleName,
      descripcion: updated.descripcion ?? defaultDescriptions[roleName] ?? roleName,
      permisos: [],
      usuarios: count,
      estado: updated.estado === 'INACTIVO' ? 'Inactivo' : 'Activo',
    };
  }

  async updateRoleStatus(nombre: string, estado: 'Activo' | 'Inactivo'): Promise<RoleData> {
    const roleName = nombre.startsWith('R-') ? nombre.slice(2) : nombre;
    const values = Object.values(Role) as Role[];
    if (!values.includes(roleName as Role)) {
      throw new NotFoundError(`Rol "${roleName}" no existe. Los roles válidos son: ${values.join(', ')}`);
    }
    const roleEstado = estado === 'Activo' ? 'ACTIVO' : 'INACTIVO';
    const roleConfig = await this.prisma.roleConfig.upsert({
      where: { role: roleName as Role },
      update: { estado: roleEstado },
      create: { role: roleName as Role, estado: roleEstado },
    });
    const count = await this.prisma.user.count({ where: { role: roleName as Role, deletedAt: null } });
    const descriptions: Record<string, string> = {
      ADMIN: 'Administrador del sistema',
      ASESOR: 'Asesor de ventas',
      DOMICILIARIO: 'Domiciliario',
      CLIENTE: 'Cliente',
      ALMACEN: 'Almacén',
      PRODUCCION: 'Producción',
      REPORTES: 'Reportes',
    };
    return {
      id: `R-${roleName}`,
      nombre: roleName,
      descripcion: descriptions[roleName] ?? roleName,
      permisos: [],
      usuarios: count,
      estado: roleConfig.estado === 'INACTIVO' ? 'Inactivo' : 'Activo',
    };
  }

  async deleteRole(_nombre: string): Promise<void> {
    throw new Error('No se puede eliminar este rol porque está definido por enum en Prisma');
  }

  async delete(id: string): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) throw new NotFoundError('Usuario no encontrado');
    await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async updateTwoFactorSecret(id: string, secret: string | null): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { twoFactorSecret: secret } });
  }

  async enableTwoFactor(id: string, enabled: boolean): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { twoFactorEnabled: enabled } });
  }

  async setResetPasswordToken(id: string, token: string, expires: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { resetPasswordToken: token, resetPasswordExpires: expires },
    });
  }

  async findByResetPasswordToken(token: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findFirst({
      where: { resetPasswordToken: token, deletedAt: null },
    });
    return user ? toRecord(user) : null;
  }

  async clearResetPasswordToken(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { resetPasswordToken: null, resetPasswordExpires: null },
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  async incrementFailedLoginAttempts(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { failedLoginAttempts: { increment: 1 } },
    });
  }

  async resetFailedLoginAttempts(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }

  async lockUser(id: string, until: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lockedUntil: until },
    });
  }

  async updateGoogleId(id: string, googleId: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { googleId } });
  }
}