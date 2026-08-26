import type { SidebarItem } from '@/shared/layouts/Sidebar';
import type { User } from '@/core/stores/authStore';
import {
  MODULE_MAP,
  SIDEBAR_KEY_TO_MODULES,
} from '@/shared/config/systemModules';

function getUserPermissionSet(user: User | null): Set<string> {
  return new Set(user?.permissions ?? []);
}

function userHasAnyModulePermission(moduleKey: string, userPerms: Set<string>): boolean {
  const mod = MODULE_MAP[moduleKey];
  if (!mod) return false;
  return mod.permissionCodes.some((code) => userPerms.has(code));
}

export function hasMenuPermission(itemKey: string, user: User | null): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;

  if (itemKey === 'dashboard') return true;

  const moduleKeys = SIDEBAR_KEY_TO_MODULES[itemKey];
  if (!moduleKeys || moduleKeys.length === 0) {
    return true;
  }

  const userPerms = getUserPermissionSet(user);
  return moduleKeys.some((mk) => userHasAnyModulePermission(mk, userPerms));
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

export { MENU_ITEM_PERMISSIONS };

const MENU_ITEM_PERMISSIONS: Record<string, string | string[]> = {
  dashboard: 'dashboard:always',
  'configuracion.gestion-roles-permisos': 'auth:manage',
  'usuarios.gestion-usuarios': 'auth:manage',
  'usuarios.gestion-acceso': 'auth:manage',
  'usuarios.empleados': 'employees:read',
  'compras.compras': 'purchases:read',
  'compras.insumos': 'stock:read',
  'compras.categorias-insumos': 'stock:read',
  'compras.proveedores': 'stock:read',
  'ventas-pedidos.pedidos': 'orders:read',
  'ventas-pedidos.pedidos-personalizados': 'customOrders:read',
  'ventas-pedidos.gestion-ventas': 'sales:read',
  'ventas-pedidos.facturacion': 'receipts:read',
  'ventas-pedidos.pagos': 'payments:read',
  'ventas-pedidos.clientes': 'customers:read',
  'ventas-pedidos.domicilios': 'deliveries:read',
  'ventas-pedidos.ruta-del-dia': 'deliveries:read',
  'produccion.catalogo': 'catalog:read',
  'produccion.talleres': 'production:read',
  'produccion.prendas': 'production:update',
  'produccion.asignacion': 'production:update',
  'produccion.seguimiento': 'production:read',
  'produccion.categorias': 'catalog:read',
  'reportes.reportes/ventas': 'reports:read',
  'reportes.reportes/finanzas': 'reports:read',
  'reportes.reportes/usuarios': 'reports:read',
  'reportes.reportes/produccion': 'reports:read',
  'reportes.reportes/inventario': 'reports:read',
  'reportes.alertas-stock': 'stock:read',
};
