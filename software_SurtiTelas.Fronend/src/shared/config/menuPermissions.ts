import type { SidebarItem } from '@/shared/layouts/Sidebar';
import type { User } from '@/core/stores/authStore';

export const MENU_ITEM_PERMISSIONS: Record<string, string | string[]> = {
  dashboard: 'dashboard:read',
  usuarios: 'users:read',
  'usuarios.gestion-usuarios': 'users:manage',
  'usuarios.gestion-acceso': 'access:manage',
  'usuarios.empleados': 'employees:read',
  'usuarios.gestion-ventas': 'sales:read',
  configuracion: 'config:read',
  'configuracion.gestion-roles-permisos': ['roles:read', 'permissions:read'],
  inventario: 'inventory:read',
  'inventario.productos': 'catalog:read',
  'inventario.insumos': 'stock:read',
  'inventario.proveedores': 'suppliers:read',
  'inventario.alertasStock': 'stock:read',
  'inventario.stockDevuelto': 'returns:read',
  'inventario.categorias': 'catalog:read',
  'inventario.categorias-insumos': 'catalog:read',
  'inventario.compras': 'suppliers:read',
  produccion: 'production:read',
  'produccion.talleres': 'production:read',
  'produccion.prendas': 'production:update',
  'produccion.asignacion': 'production:update',
  'produccion.seguimiento': 'production:read',
  domicilios: 'deliveries:read',
  'ventas-pedidos': 'orders:read',
  'ventas-pedidos.pedidos': 'orders:read',
  'ventas-pedidos.cotizaciones': 'orders:read',
  'ventas-pedidos.gestion-ventas': 'sales:read',
  'ventas-pedidos.facturacion': 'payments:read',
  'ventas-pedidos.pagos': 'payments:read',
  'ventas-pedidos.clientes': 'customers:read',
  'ventas-pedidos.domicilios': 'deliveries:read',
  'ventas-pedidos.ruta-del-dia': 'deliveries:read',
  'ventas-pedidos.stock-devuelto': 'returns:read',
  reportes: 'reports:read',
  'reportes.reportes-ventas': 'reports:read',
  'reportes.reportes-usuarios': 'reports:read',
  'reportes.reportes-produccion': 'reports:read',
  'reportes.reportes-inventario': 'reports:read',
  catalogo: 'catalog:read',
  webhooks: 'webhooks:read',
  'ruta-del-dia': 'deliveries:read',
  finanzas: 'financial:read',
};

export function hasMenuPermission(itemKey: string, user: User | null): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const required = MENU_ITEM_PERMISSIONS[itemKey];
  if (!required) return true;
  const codes = Array.isArray(required) ? required : [required];
  return codes.some(code => user.permissions?.includes(code));
}

export function filterMenuByPermissions(menu: SidebarItem[], user: User | null): SidebarItem[] {
  if (!user || user.role === 'admin') return menu;

  return menu.reduce<SidebarItem[]>((acc, item) => {
    const itemKey = String(item.key ?? item.label ?? '');
    if (!hasMenuPermission(itemKey, user)) {
      return acc;
    }

    if (item.subItems && item.subItems.length > 0) {
      const filteredSubs = item.subItems
        .map(sub => ({ ...sub, key: `${itemKey}.${sub.key}` }))
        .filter(sub => hasMenuPermission(`${itemKey}.${sub.key}`, user));

      if (filteredSubs.length > 0) {
        acc.push({ ...item, subItems: filteredSubs });
      }
      return acc;
    }

    acc.push(item);
    return acc;
  }, []);
}
