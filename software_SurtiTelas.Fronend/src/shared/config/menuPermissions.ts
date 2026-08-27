import type { SidebarItem } from '@/shared/layouts/Sidebar';
import type { User } from '@/core/stores/authStore';
import {
  MODULE_MAP,
  SYSTEM_MODULES,
} from '@/shared/config/systemModules';

function getUserPermissionSet(user: User | null): Set<string> {
  return new Set(user?.permissions ?? []);
}

function userHasAnyModulePermission(moduleKey: string, userPerms: Set<string>): boolean {
  const mod = MODULE_MAP[moduleKey];
  if (!mod) return false;
  return mod.permissionCodes.some((code) => userPerms.has(code));
}

const MENU_KEY_TO_MODULE: Record<string, string> = {
  'configuracion.gestion-roles-permisos': 'admin.roles.permisos',
  'usuarios.gestion-usuarios': 'admin.usuarios',
  'usuarios.gestion-acceso': 'admin.acceso',
  'usuarios.empleados': 'admin.empleados',
  'compras.compras': 'admin.compras',
  'compras.insumos': 'admin.insumos',
  'compras.categorias-insumos': 'admin.insumos.categorias',
  'compras.proveedores': 'admin.proveedores',
  'ventas-pedidos.pedidos': 'admin.pedidos',
  'ventas-pedidos.pedidos-personalizados': 'admin.pedidos.personalizados',
  'ventas-pedidos.gestion-ventas': 'admin.ventas',
  'ventas-pedidos.facturacion': 'admin.facturacion',
  'ventas-pedidos.pagos': 'admin.pagos',
  'ventas-pedidos.clientes': 'admin.clientes',
  'ventas-pedidos.domicilios': 'admin.domicilios',
  'ventas-pedidos.ruta-del-dia': 'admin.ruta.dia',
  'ventas-pedidos.devoluciones': 'admin.devoluciones',
  'produccion.catalogo': 'admin.catalogo',
  'produccion.talleres': 'admin.talleres',
  'produccion.prendas': 'admin.prendas',
  'produccion.asignacion': 'admin.produccion.asignacion',
  'produccion.seguimiento': 'admin.produccion.seguimiento',
  'produccion.categorias': 'admin.categorias',
  'reportes.reportes/ventas': 'admin.reportes.ventas',
  'reportes.reportes/finanzas': 'admin.reportes.finanzas',
  'reportes.reportes/usuarios': 'admin.reportes.usuarios',
  'reportes.reportes/produccion': 'admin.reportes.produccion',
  'reportes.reportes/inventario': 'admin.reportes.inventario',
  'reportes.alertas-stock': 'admin.alertas.stock',
};

export function hasMenuPermission(itemKey: string, user: User | null): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;

  if (itemKey === 'dashboard') return true;

  const moduleKey = MENU_KEY_TO_MODULE[itemKey];
  if (moduleKey) {
    const userPerms = getUserPermissionSet(user);
    return userHasAnyModulePermission(moduleKey, userPerms);
  }

  if (MODULE_MAP[itemKey]) {
    const userPerms = getUserPermissionSet(user);
    return userHasAnyModulePermission(itemKey, userPerms);
  }

  return false;
}

export function filterMenuByPermissions(menu: SidebarItem[], user: User | null): SidebarItem[] {
  if (!user || user.role === 'admin') return menu;

  return menu.reduce<SidebarItem[]>((acc, item) => {
    const itemKey = String(item.key ?? item.label ?? '');

    if (itemKey === 'dashboard') {
      acc.push(item);
      return acc;
    }

    if (item.subItems && item.subItems.length > 0) {
      const visibleSubs = item.subItems.filter((sub) => {
        const subKey = sub.key ?? sub.label ?? '';
        const compositeKey = `${itemKey}.${subKey}`;
        return hasMenuPermission(compositeKey, user);
      });

      if (visibleSubs.length > 0) {
        acc.push({ ...item, subItems: visibleSubs });
      }
      return acc;
    }

    if (hasMenuPermission(itemKey, user)) {
      acc.push(item);
    }
    return acc;
  }, []);
}

export function getModuleKeysFromPermissions(permissions: string[]): string[] {
  const permSet = new Set(permissions);
  return SYSTEM_MODULES.filter((mod) =>
    mod.permissionCodes.some((code) => permSet.has(code))
  ).map((mod) => mod.key);
}
