import type { RoleRepository, RoleConfigData } from '../../domain/repositories/EmployeeRepository';
import { PrismaClient } from '@prisma/client';

export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listAvailableRoles(): Promise<RoleConfigData[]> {
    const roleConfigs = await this.prisma.roleConfig.findMany({
      where: { estado: 'ACTIVO' },
    });

    const counts = await this.prisma.user.groupBy({
      by: ['role'],
      where: { deletedAt: null },
      _count: { role: true },
    });

    const countMap = new Map<string, number>();
    for (const row of counts) {
      countMap.set(row.role, row._count?.role ?? 0);
    }

    const allRolePerms = await this.prisma.rolePermission.findMany({
      where: { role: { in: roleConfigs.map((rc) => rc.role) } },
      include: { permission: { select: { code: true } } },
    });
    const permMap = new Map<string, string[]>();
    for (const rp of allRolePerms) {
      const existing = permMap.get(rp.role) ?? [];
      existing.push(rp.permission.code);
      permMap.set(rp.role, existing);
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

    const roles = roleConfigs.length > 0
      ? roleConfigs.map((rc) => ({
          id: `R-${rc.role}`,
          role: rc.role,
          nombre: rc.role,
          descripcion: rc.descripcion ?? defaultDescriptions[rc.role] ?? rc.role,
          estado: rc.estado === 'ACTIVO' ? 'Activo' as const : 'Inactivo' as const,
          permisos: permMap.get(rc.role) ?? [],
          usuarios: countMap.get(rc.role) ?? 0,
        }))
      : [
          'ADMIN', 'ASESOR', 'DOMICILIARIO', 'CLIENTE', 'ALMACEN', 'PRODUCCION', 'REPORTES'
        ].map((name) => ({
          id: `R-${name}`,
          role: name,
          nombre: name,
          descripcion: defaultDescriptions[name] ?? name,
          estado: 'Activo' as const,
          permisos: [],
          usuarios: countMap.get(name) ?? 0,
        }));

    return roles.filter((r) => r.usuarios > 0 || r.estado === 'Activo');
  }
}
