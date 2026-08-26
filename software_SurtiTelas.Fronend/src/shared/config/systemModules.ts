import {
  Shield,
  Users,
  UserCog,
  ShoppingBag,
  Boxes,
  Truck,
  ShoppingCart,
  Receipt,
  DollarSign,
  MapPin,
  Factory,
  BarChart3,
  FolderTree,
  AlertTriangle,
  PackageOpen,
  Bell,
  TrendingUp,
  MessageCircle,
  RotateCcw,
  Scissors,
  Globe,
  Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ModuleCategory =
  | 'dashboard'
  | 'configuracion'
  | 'usuarios'
  | 'compras'
  | 'existencias'
  | 'produccion'
  | 'ventas'
  | 'reportes';

export const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  dashboard: 'Dashboard',
  configuracion: 'Configuración',
  usuarios: 'Usuarios y Acceso',
  compras: 'Compras',
  existencias: 'Existencias',
  produccion: 'Producción',
  ventas: 'Ventas / Pedidos',
  reportes: 'Dashboard / Reportes',
};

export interface SystemModule {
  key: string;
  name: string;
  description: string;
  category: ModuleCategory;
  permissionCodes: string[];
  readPermission: string;
  icon: LucideIcon;
  sidebarKeys: string[];
  estado: 'ACTIVO' | 'INACTIVO';
}

export const SYSTEM_MODULES: SystemModule[] = [
  {
    key: 'catalog',
    name: 'Productos',
    description: 'Gestión de productos terminados, categorías y favors',
    category: 'existencias',
    permissionCodes: [
      'catalog:read',
      'catalog:create',
      'catalog:update',
      'catalog:delete',
      'catalog:publish',
    ],
    readPermission: 'catalog:read',
    icon: PackageOpen,
    sidebarKeys: ['produccion.catalogo', 'produccion.categorias'],
    estado: 'ACTIVO',
  },
  {
    key: 'customers',
    name: 'Clientes',
    description: 'Gestión de clientes y cupos',
    category: 'ventas',
    permissionCodes: [
      'customers:read',
      'customers:create',
      'customers:update',
      'customers:delete',
    ],
    readPermission: 'customers:read',
    icon: Users,
    sidebarKeys: ['ventas-pedidos.clientes'],
    estado: 'ACTIVO',
  },
  {
    key: 'orders',
    name: 'Pedidos',
    description: 'Gestión de pedidos de producción y seguimiento',
    category: 'ventas',
    permissionCodes: [
      'orders:read',
      'orders:create',
      'orders:update',
      'orders:delete',
    ],
    readPermission: 'orders:read',
    icon: ShoppingCart,
    sidebarKeys: ['ventas-pedidos.pedidos'],
    estado: 'ACTIVO',
  },
  {
    key: 'stock',
    name: 'Existencias',
    description: 'Proveedores, insumos, movimientos y alertas de stock',
    category: 'existencias',
    permissionCodes: [
      'stock:read',
      'stock:create',
      'stock:update',
      'stock:delete',
      'stock:move',
      'stock:manage',
    ],
    readPermission: 'stock:read',
    icon: Boxes,
    sidebarKeys: [
      'compras.insumos',
      'compras.categorias-insumos',
      'compras.proveedores',
      'reportes.alertas-stock',
    ],
    estado: 'ACTIVO',
  },
  {
    key: 'production',
    name: 'Producción',
    description: 'Órdenes de producción, talleres y control de prendas',
    category: 'produccion',
    permissionCodes: [
      'production:read',
      'production:create',
      'production:update',
      'production:delete',
    ],
    readPermission: 'production:read',
    icon: Factory,
    sidebarKeys: [
      'produccion.talleres',
      'produccion.prendas',
      'produccion.asignacion',
      'produccion.seguimiento',
    ],
    estado: 'ACTIVO',
  },
  {
    key: 'auth',
    name: 'Autenticación y Acceso',
    description: 'Gestión de usuarios, roles, permisos y configuración de acceso',
    category: 'configuracion',
    permissionCodes: ['auth:manage'],
    readPermission: 'auth:manage',
    icon: Shield,
    sidebarKeys: [
      'configuracion.gestion-roles-permisos',
      'usuarios.gestion-usuarios',
      'usuarios.gestion-acceso',
    ],
    estado: 'ACTIVO',
  },
  {
    key: 'employees',
    name: 'Empleados',
    description: 'Gestión de empleados y perfiles laborales',
    category: 'usuarios',
    permissionCodes: [
      'employees:read',
      'employees:create',
      'employees:update',
      'employees:delete',
    ],
    readPermission: 'employees:read',
    icon: UserCog,
    sidebarKeys: ['usuarios.empleados'],
    estado: 'ACTIVO',
  },
  {
    key: 'purchases',
    name: 'Compras',
    description: 'Gestión de órdenes y items de compra',
    category: 'compras',
    permissionCodes: [
      'purchases:read',
      'purchases:create',
      'purchases:update',
      'purchases:delete',
    ],
    readPermission: 'purchases:read',
    icon: ShoppingBag,
    sidebarKeys: ['compras.compras'],
    estado: 'ACTIVO',
  },
  {
    key: 'sales',
    name: 'Ventas',
    description: 'Gestión de ventas y facturas de órdenes',
    category: 'ventas',
    permissionCodes: [
      'sales:read',
      'sales:create',
      'sales:update',
    ],
    readPermission: 'sales:read',
    icon: TrendingUp,
    sidebarKeys: ['ventas-pedidos.gestion-ventas'],
    estado: 'ACTIVO',
  },
  {
    key: 'payments',
    name: 'Pagos',
    description: 'Gestión de pagos de pedidos y clientes',
    category: 'ventas',
    permissionCodes: [
      'payments:read',
      'payments:create',
      'payments:update',
      'payments:delete',
    ],
    readPermission: 'payments:read',
    icon: DollarSign,
    sidebarKeys: ['ventas-pedidos.pagos'],
    estado: 'ACTIVO',
  },
  {
    key: 'receipts',
    name: 'Facturación',
    description: 'Emisión y gestión de recibos de venta',
    category: 'ventas',
    permissionCodes: [
      'receipts:read',
      'receipts:create',
      'receipts:update',
      'receipts:delete',
    ],
    readPermission: 'receipts:read',
    icon: Receipt,
    sidebarKeys: ['ventas-pedidos.facturacion'],
    estado: 'ACTIVO',
  },
  {
    key: 'commissions',
    name: 'Comisiones',
    description: 'Gestión de comisiones de asesores',
    category: 'reportes',
    permissionCodes: [
      'commissions:read',
      'commissions:create',
    ],
    readPermission: 'commissions:read',
    icon: BarChart3,
    sidebarKeys: [],
    estado: 'ACTIVO',
  },
  {
    key: 'deliveries',
    name: 'Domicilios',
    description: 'Gestión de entregas y asignación de domiciliarios',
    category: 'ventas',
    permissionCodes: [
      'deliveries:read',
      'deliveries:create',
      'deliveries:update',
    ],
    readPermission: 'deliveries:read',
    icon: MapPin,
    sidebarKeys: [
      'ventas-pedidos.domicilios',
      'ventas-pedidos.ruta-del-dia',
    ],
    estado: 'ACTIVO',
  },
  {
    key: 'domiciliarios',
    name: 'Domiciliarios',
    description: 'Gestión de domiciliarios y zonas de reparto',
    category: 'usuarios',
    permissionCodes: [
      'domiciliarios:read',
      'domiciliarios:create',
      'domiciliarios:update',
    ],
    readPermission: 'domiciliarios:read',
    icon: Truck,
    sidebarKeys: [],
    estado: 'ACTIVO',
  },
  {
    key: 'notifications',
    name: 'Notificaciones',
    description: 'Gestión de notificaciones del sistema',
    category: 'reportes',
    permissionCodes: [
      'notifications:read',
      'notifications:update',
    ],
    readPermission: 'notifications:read',
    icon: Bell,
    sidebarKeys: [],
    estado: 'ACTIVO',
  },
  {
    key: 'reports',
    name: 'Reportes',
    description: 'Reportes analíticos y estadísticas',
    category: 'reportes',
    permissionCodes: ['reports:read'],
    readPermission: 'reports:read',
    icon: FolderTree,
    sidebarKeys: [
      'reportes.reportes/ventas',
      'reportes.reportes/finanzas',
      'reportes.reportes/usuarios',
      'reportes.reportes/produccion',
      'reportes.reportes/inventario',
    ],
    estado: 'ACTIVO',
  },
  {
    key: 'cms',
    name: 'Páginas Web',
    description: 'Gestión de contenido institucional',
    category: 'configuracion',
    permissionCodes: [
      'cms:read',
      'cms:update',
    ],
    readPermission: 'cms:read',
    icon: Globe,
    sidebarKeys: [],
    estado: 'ACTIVO',
  },
  {
    key: 'contact',
    name: 'Mensajes de Contacto',
    description: 'Gestión de mensajes de contacto del sitio web',
    category: 'configuracion',
    permissionCodes: [
      'contact:read',
      'contact:update',
    ],
    readPermission: 'contact:read',
    icon: MessageCircle,
    sidebarKeys: [],
    estado: 'ACTIVO',
  },
  {
    key: 'returns',
    name: 'Devoluciones',
    description: 'Gestión de devoluciones y reingresos de stock',
    category: 'existencias',
    permissionCodes: [
      'returns:read',
      'returns:create',
      'returns:update',
    ],
    readPermission: 'returns:read',
    icon: RotateCcw,
    sidebarKeys: [],
    estado: 'ACTIVO',
  },
  {
    key: 'customOrders',
    name: 'Pedidos Personalizados',
    description: 'Gestión de pedidos de personalización',
    category: 'ventas',
    permissionCodes: [
      'customOrders:read',
      'customOrders:update',
      'customOrders:delete',
    ],
    readPermission: 'customOrders:read',
    icon: Scissors,
    sidebarKeys: ['ventas-pedidos.pedidos-personalizados'],
    estado: 'ACTIVO',
  },
  {
    key: 'company',
    name: 'Configuración Empresa',
    description: 'Configuración general de la empresa',
    category: 'configuracion',
    permissionCodes: ['company:update'],
    readPermission: 'company:update',
    icon: Settings,
    sidebarKeys: [],
    estado: 'ACTIVO',
  },
  {
    key: 'alerts',
    name: 'Alertas',
    description: 'Gestión de alertas del sistema',
    category: 'configuracion',
    permissionCodes: [
      'alerts:read',
      'alerts:create',
      'alerts:update',
    ],
    readPermission: 'alerts:read',
    icon: AlertTriangle,
    sidebarKeys: [],
    estado: 'ACTIVO',
  },
];

export const MODULE_MAP: Record<string, SystemModule> = SYSTEM_MODULES.reduce(
  (acc, m) => {
    acc[m.key] = m;
    return acc;
  },
  {} as Record<string, SystemModule>,
);

export const SIDEBAR_KEY_TO_MODULES: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {};
  for (const mod of SYSTEM_MODULES) {
    for (const key of mod.sidebarKeys) {
      if (!map[key]) map[key] = [];
      if (!map[key].includes(mod.key)) map[key].push(mod.key);
    }
  }
  return map;
})();

export const MODULE_READ_PERMISSIONS: Record<string, string> = SYSTEM_MODULES.reduce(
  (acc, m) => {
    acc[m.key] = m.readPermission;
    return acc;
  },
  {} as Record<string, string>,
);

export const ALL_PERMISSION_CODES: string[] = SYSTEM_MODULES.flatMap((m) => m.permissionCodes);

export const ALL_MODULE_KEYS: string[] = SYSTEM_MODULES.map((m) => m.key);

export function getModulesGroupedByCategory(): Record<ModuleCategory, SystemModule[]> {
  const result: Record<ModuleCategory, SystemModule[]> = {
    dashboard: [],
    configuracion: [],
    usuarios: [],
    compras: [],
    existencias: [],
    produccion: [],
    ventas: [],
    reportes: [],
  };
  for (const mod of SYSTEM_MODULES) {
    result[mod.category].push(mod);
  }
  return result;
}

export function getPermissionIdsForModules(
  permissionList: { id: string; code: string; module: string }[],
  moduleKeys: string[],
): string[] {
  const codes = new Set<string>();
  for (const key of moduleKeys) {
    const mod = MODULE_MAP[key];
    if (mod) {
      for (const code of mod.permissionCodes) {
        codes.add(code);
      }
    }
  }
  return permissionList
    .filter((p) => codes.has(p.code))
    .map((p) => p.id);
}

export function getAssignmentFromPermissions(
  userPermissions: string[],
): string[] {
  return SYSTEM_MODULES.filter((mod) =>
    mod.permissionCodes.some((code) => userPermissions.includes(code))
  ).map((mod) => mod.key);
}
