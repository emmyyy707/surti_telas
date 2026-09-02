import {
  ShoppingCart,
  FileText,
  Factory,
  Package,
  Users,
  MapPin,
  CreditCard,
  Receipt,
  RotateCcw,
  UserPlus,
  Shield,
  Boxes,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type EntityType =
  | 'ORDER'
  | 'CUSTOM_ORDER'
  | 'QUOTE'
  | 'QUOTE_NEGOTIATION'
  | 'PRODUCTION_ORDER'
  | 'PRODUCT'
  | 'CUSTOMER'
  | 'DELIVERY'
  | 'PAYMENT'
  | 'RECEIPT'
  | 'RETURN'
  | 'USER'
  | 'RAW_MATERIAL'
  | 'WORKSHOP'
  | 'CONTROL_PRENDA'
  | 'SUPPLIER';

export type ModuleKey =
  | 'pedidos'
  | 'cotizaciones'
  | 'produccion'
  | 'catalogo'
  | 'clientes'
  | 'domicilios'
  | 'pagos'
  | 'facturacion'
  | 'devoluciones'
  | 'usuarios'
  | 'existencias'
  | 'talleres';

export interface NotificationRoute {
  path: string;
  module: ModuleKey;
  label: string;
}

const MODULE_LABELS: Record<ModuleKey, string> = {
  pedidos: 'Pedidos',
  cotizaciones: 'Cotizaciones',
  produccion: 'Producción',
  catalogo: 'Catálogo',
  clientes: 'Clientes',
  domicilios: 'Domicilios',
  pagos: 'Pagos',
  facturacion: 'Facturación',
  devoluciones: 'Devoluciones',
  usuarios: 'Usuarios',
  existencias: 'Existencias',
  talleres: 'Talleres',
};

export function getModuleLabel(module: ModuleKey): string {
  return MODULE_LABELS[module] ?? module;
}

const ADMIN_ROLES = new Set(['admin', 'almacen', 'produccion', 'reportes']);

const getBase = (role: string): string => {
  if (ADMIN_ROLES.has(role)) return '/admin';
  if (role === 'asesor') return '/asesor';
  if (role === 'cliente') return '/cliente';
  if (role === 'domiciliario') return '/domiciliario';
  return '/admin';
};

export function getFallback(role: string): string {
  if (ADMIN_ROLES.has(role)) return '/admin/notificaciones';
  if (role === 'asesor') return '/asesor/pedidos';
  if (role === 'cliente') return '/cliente/inicio';
  if (role === 'domiciliario') return '/domiciliario/entregas';
  return '/admin/notificaciones';
}

const ADMIN_ROUTE_MAP: Record<string, string> = {
  ORDER: '/admin/pedidos',
  CUSTOM_ORDER: '/admin/pedidos-personalizados',
  QUOTE: '/admin/pedidos-personalizados',
  QUOTE_NEGOTIATION: '/admin/pedidos-personalizados',
  PRODUCTION_ORDER: '/admin/produccion',
  CONTROL_PRENDA: '/admin/prendas',
  WORKSHOP: '/admin/talleres',
  PRODUCT: '/admin/catalogo',
  CUSTOMER: '/admin/clientes',
  DELIVERY: '/admin/domicilios',
  PAYMENT: '/admin/pagos',
  RECEIPT: '/admin/facturacion',
  RETURN: '/admin/stock-devuelto',
  USER: '/admin/gestion-usuarios',
  RAW_MATERIAL: '/admin/inventario',
  SUPPLIER: '/admin/proveedores',
};

const ASESOR_ROUTE_MAP: Record<string, string> = {
  ORDER: '/asesor/pedidos',
  CUSTOMER: '/asesor/clientes',
  PRODUCT: '/asesor/catalogo',
};

const DOMICILIARIO_ROUTE_MAP: Record<string, string> = {
  ORDER: '/domiciliario/entregas',
  DELIVERY: '/domiciliario/entregas',
};

const CLIENTE_ROUTE_MAP: Record<string, string | null> = {
  ORDER: null,
  CUSTOM_ORDER: '/cliente/pedidos-personalizados',
  QUOTE: '/cliente/pedidos-personalizados',
  QUOTE_NEGOTIATION: '/cliente/pedidos-personalizados',
  PRODUCT: '/catalogo',
  PAYMENT: '/cliente/recibos',
  RECEIPT: '/cliente/recibos',
};

const ROUTE_TO_MODULE: Record<string, ModuleKey> = {
  '/admin/pedidos': 'pedidos',
  '/admin/pedidos-personalizados': 'cotizaciones',
  '/admin/produccion': 'produccion',
  '/admin/catalogo': 'catalogo',
  '/admin/clientes': 'clientes',
  '/admin/domicilios': 'domicilios',
  '/admin/pagos': 'pagos',
  '/admin/facturacion': 'facturacion',
  '/admin/stock-devuelto': 'devoluciones',
  '/admin/gestion-usuarios': 'usuarios',
  '/admin/inventario': 'existencias',
  '/admin/talleres': 'talleres',
  '/admin/prendas': 'produccion',
  '/admin/proveedores': 'existencias',
  '/asesor/pedidos': 'pedidos',
  '/asesor/clientes': 'clientes',
  '/asesor/catalogo': 'catalogo',
  '/domiciliario/entregas': 'domicilios',
  '/cliente/seguimiento': 'pedidos',
  '/cliente/pedidos-personalizados': 'cotizaciones',
  '/catalogo': 'catalogo',
  '/cliente/recibos': 'pagos',
};

const ROUTE_TO_LABEL: Record<string, string> = {
  '/admin/pedidos': 'Pedido',
  '/admin/pedidos-personalizados': 'Solicitud',
  '/admin/produccion': 'Orden de producción',
  '/admin/catalogo': 'Producto',
  '/admin/clientes': 'Cliente',
  '/admin/domicilios': 'Entrega',
  '/admin/pagos': 'Pago',
  '/admin/facturacion': 'Recibo',
  '/admin/stock-devuelto': 'Devolución',
  '/admin/gestion-usuarios': 'Usuario',
  '/admin/inventario': 'Insumo',
  '/admin/talleres': 'Taller',
  '/admin/prendas': 'Control de prenda',
  '/admin/proveedores': 'Proveedor',
  '/asesor/pedidos': 'Pedido',
  '/asesor/clientes': 'Cliente',
  '/asesor/catalogo': 'Producto',
  '/domiciliario/entregas': 'Entrega',
  '/cliente/seguimiento': 'Pedido',
  '/cliente/pedidos-personalizados': 'Solicitud',
  '/catalogo': 'Producto',
  '/cliente/recibos': 'Pago',
};

export function resolveNotificationRoute(
  entityType: string | undefined,
  entityId: string | undefined,
  role: string = 'admin'
): NotificationRoute | null {
  if (!entityType) return null;

  const _base = getBase(role);
  const hasId = Boolean(entityId);

  if (ADMIN_ROLES.has(role)) {
    const path = ADMIN_ROUTE_MAP[entityType];
    if (path) {
      return { path, module: ROUTE_TO_MODULE[path], label: ROUTE_TO_LABEL[path] };
    }
    return { path: getFallback(role), module: 'pedidos', label: 'Notificaciones' };
  }

  if (role === 'asesor') {
    const path = ASESOR_ROUTE_MAP[entityType];
    if (path) {
      return { path, module: ROUTE_TO_MODULE[path], label: ROUTE_TO_LABEL[path] };
    }
    return { path: getFallback(role), module: 'pedidos', label: 'Pedidos' };
  }

  if (role === 'domiciliario') {
    const path = DOMICILIARIO_ROUTE_MAP[entityType];
    if (path) {
      return { path, module: ROUTE_TO_MODULE[path], label: ROUTE_TO_LABEL[path] };
    }
    return { path: getFallback(role), module: 'domicilios', label: 'Entregas' };
  }

  if (role === 'cliente') {
    if (entityType === 'ORDER' && hasId) {
      return { path: `/cliente/seguimiento/${entityId}`, module: 'pedidos', label: 'Pedido' };
    }
    const path = CLIENTE_ROUTE_MAP[entityType];
    if (path) {
      return { path, module: ROUTE_TO_MODULE[path], label: ROUTE_TO_LABEL[path] };
    }
    return { path: getFallback(role), module: 'pedidos', label: 'Inicio' };
  }

  const fallback = getFallback(role);
  return { path: fallback, module: 'pedidos', label: 'Notificaciones' };
}

export function getNotificationIcon(entityType: string | undefined, tipo: string): string {
  if (entityType === 'ORDER' || entityType === 'CUSTOM_ORDER') return 'ShoppingCart';
  if (entityType === 'QUOTE' || entityType === 'QUOTE_NEGOTIATION') return 'FileText';
  if (entityType === 'PRODUCTION_ORDER' || entityType === 'CONTROL_PRENDA' || entityType === 'WORKSHOP') return 'Factory';
  if (entityType === 'PRODUCT') return 'Package';
  if (entityType === 'CUSTOMER') return 'Users';
  if (entityType === 'DELIVERY') return 'MapPin';
  if (entityType === 'PAYMENT') return 'CreditCard';
  if (entityType === 'RECEIPT') return 'Receipt';
  if (entityType === 'RETURN') return 'RotateCcw';
  if (entityType === 'USER') return 'UserPlus';
  if (entityType === 'RAW_MATERIAL' || entityType === 'SUPPLIER') return 'Boxes';

  switch (tipo) {
    case 'success': return 'CheckCircle';
    case 'danger': return 'XCircle';
    case 'warning': return 'AlertTriangle';
    default: return 'Info';
  }
}

export const NOTIFICATION_ICON_MAP: Record<string, LucideIcon> = {
  ShoppingCart,
  FileText,
  Factory,
  Package,
  Users,
  MapPin,
  CreditCard,
  Receipt,
  RotateCcw,
  UserPlus,
  Shield,
  Boxes,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
};

export function computeModuleSummary(notifications: { modulo?: string; leida: boolean }[]): Record<ModuleKey, number> {
  const summary: Record<ModuleKey, number> = {
    pedidos: 0,
    cotizaciones: 0,
    produccion: 0,
    catalogo: 0,
    clientes: 0,
    domicilios: 0,
    pagos: 0,
    facturacion: 0,
    devoluciones: 0,
    usuarios: 0,
    existencias: 0,
    talleres: 0,
  };

  const moduloToModule: Record<string, ModuleKey> = {
    ORDERS: 'pedidos',
    PEDIDOS_PERSONALIZADOS: 'cotizaciones',
    PRODUCTION: 'produccion',
    CATALOG: 'catalogo',
    CUSTOMERS: 'clientes',
    DELIVERIES: 'domicilios',
    PAYMENTS: 'pagos',
    RECEIPTS: 'facturacion',
    RETURNS: 'devoluciones',
    USERS: 'usuarios',
    STOCK: 'existencias',
  };

  for (const notif of notifications) {
    if (notif.leida || !notif.modulo) continue;
    const module = moduloToModule[notif.modulo];
    if (module) {
      summary[module]++;
    }
  }

  return summary;
}
