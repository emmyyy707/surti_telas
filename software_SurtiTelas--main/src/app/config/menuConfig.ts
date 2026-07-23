import {
  LayoutDashboard,
  Settings,
  Users,
  Package,
  Factory,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Truck,
  UserCheck,
  ClipboardList,
  Star,
  MessageSquare,
  MapPin,
  User,
  Home,
  ShoppingBag,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  subItems?: { id: string; label: string }[];
}

// Configuración de menú para ADMINISTRADOR
export const adminMenuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard General', icon: LayoutDashboard },
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: Settings,
    subItems: [
      { id: 'roles', label: 'Roles' },
      { id: 'permisos', label: 'Permisos' },
    ]
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: Users,
    subItems: [
      { id: 'gestion-usuarios', label: 'Gestión de usuarios' },
      { id: 'gestion-acceso', label: 'Gestión de acceso' },
      { id: 'seguridad-usuarios', label: 'Seguridad de usuarios' },
    ]
  },
  {
    id: 'inventario',
    label: 'Inventario',
    icon: Package,
    subItems: [
      { id: 'gestion-insumos', label: 'Gestión de insumos' },
      { id: 'productos-terminados', label: 'Gestión de productos terminados' },
      { id: 'proveedores', label: 'Gestión de proveedores' },
      { id: 'alertas-stock', label: 'Alertas de stock' },
    ]
  },
  {
    id: 'produccion',
    label: 'Producción en Talleres Externos',
    icon: Factory,
    subItems: [
      { id: 'registro-talleres', label: 'Registro de talleres' },
      { id: 'asignacion-produccion', label: 'Asignación de producción' },
      { id: 'seguimiento-produccion', label: 'Seguimiento de producción' },
      { id: 'control-prendas', label: 'Control de prendas entregadas y recibidas' },
    ]
  },
  {
    id: 'ventas',
    label: 'Ventas y Pedidos',
    icon: ShoppingCart,
    subItems: [
      { id: 'gestion-clientes', label: 'Gestión de clientes' },
      { id: 'catalogo-digital', label: 'Catálogo digital' },
      { id: 'gestion-pedidos', label: 'Gestión de pedidos' },
      { id: 'facturacion', label: 'Facturación / ventas' },
      { id: 'pagos-abonos', label: 'Pagos, abonos, financiación' },
      { id: 'contacto-empresa', label: 'Contacto con empresa' },
      { id: 'control-stock-devuelto', label: 'Control de stock devuelto (inspección y destino)' },
    ]
  },
  {
    id: 'historial-pagos',
    label: 'Historial de Pagos',
    icon: CreditCard
  },
  {
    id: 'reportes',
    label: 'Dashboard de Reportes (Analítica)',
    icon: BarChart3,
    subItems: [
      { id: 'reportes-inventario', label: 'Reportes de inventario' },
      { id: 'reportes-produccion', label: 'Reportes de producción' },
      { id: 'reportes-ventas', label: 'Reportes de ventas' },
      { id: 'reportes-usuarios', label: 'Reportes de usuarios' },
    ]
  },
];

// Configuración de menú para ASESOR
export const asesorMenuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard General', icon: LayoutDashboard },
  {
    id: 'ventas',
    label: 'Ventas y Pedidos',
    icon: ShoppingCart,
    subItems: [
      { id: 'gestion-clientes', label: 'Gestión de clientes' },
      { id: 'catalogo-digital', label: 'Catálogo digital' },
      { id: 'gestion-pedidos', label: 'Gestión de pedidos' },
      { id: 'facturacion', label: 'Facturación / ventas' },
      { id: 'pagos-abonos', label: 'Pagos, abonos, financiación' },
      { id: 'contacto-empresa', label: 'Contacto con empresa' },
    ]
  },
  {
    id: 'clientes',
    label: 'Mis Clientes',
    icon: UserCheck,
    subItems: [
      { id: 'lista-clientes', label: 'Lista de clientes' },
      { id: 'nuevo-cliente', label: 'Registrar cliente' },
      { id: 'seguimiento', label: 'Seguimiento' },
    ]
  },
  {
    id: 'pedidos',
    label: 'Mis Pedidos',
    icon: ClipboardList,
    subItems: [
      { id: 'crear-pedido', label: 'Crear pedido' },
      { id: 'pedidos-activos', label: 'Pedidos activos' },
      { id: 'historial-pedidos', label: 'Historial de pedidos' },
    ]
  },
  {
    id: 'historial-pagos',
    label: 'Historial de Pagos',
    icon: CreditCard
  },
  {
    id: 'comisiones',
    label: 'Mis Comisiones',
    icon: BarChart3,
    subItems: [
      { id: 'comisiones-mes', label: 'Comisiones del mes' },
      { id: 'historico-comisiones', label: 'Histórico de comisiones' },
    ]
  },
  {
    id: 'calificaciones',
    label: 'Calificaciones',
    icon: Star
  },
  {
    id: 'mensajes',
    label: 'Mensajes',
    icon: MessageSquare
  },
];

// Configuración de menú para DOMICILIARIO
export const domiciliarioMenuItems: MenuItem[] = [
  {
    id: 'entregas',
    label: 'Mis Entregas',
    icon: Truck,
    subItems: [
      { id: 'entregas-pendientes', label: 'Entregas pendientes' },
      { id: 'entregas-en-proceso', label: 'En proceso' },
      { id: 'entregas-completadas', label: 'Completadas' },
    ]
  },
  {
    id: 'rutas',
    label: 'Rutas Asignadas',
    icon: ClipboardList,
    subItems: [
      { id: 'ruta-hoy', label: 'Ruta de hoy' },
      { id: 'proximas-rutas', label: 'Próximas rutas' },
      { id: 'historial-rutas', label: 'Historial de rutas' },
    ]
  },
  {
    id: 'escaner',
    label: 'Escanear QR',
    icon: Package
  },
  {
    id: 'historial',
    label: 'Mi Historial',
    icon: BarChart3,
    subItems: [
      { id: 'entregas-historico', label: 'Entregas realizadas' },
      { id: 'estadisticas', label: 'Mis estadísticas' },
    ]
  },
  {
    id: 'calificaciones',
    label: 'Calificaciones',
    icon: Star
  },
];

// Configuración de menú para CLIENTE
export const clienteMenuItems: MenuItem[] = [
  { id: 'resumen-cliente', label: 'Resumen', icon: Home },
  { id: 'catalogo-cliente', label: 'Catálogo', icon: ShoppingBag },
  { id: 'mis-pedidos-cliente', label: 'Mis Pedidos', icon: ShoppingCart },
  { id: 'direcciones-cliente', label: 'Direcciones', icon: MapPin },
  { id: 'metodos-pago-cliente', label: 'Métodos de Pago', icon: CreditCard },
  { id: 'perfil-cliente', label: 'Mi Perfil', icon: User },
];

// Función para obtener el menú según el rol
export function getMenuByRole(role: 'admin' | 'asesor' | 'domiciliario' | 'cliente' | null): MenuItem[] {
  switch (role) {
    case 'admin':
      return adminMenuItems;
    case 'asesor':
      return asesorMenuItems;
    case 'domiciliario':
      return domiciliarioMenuItems;
    case 'cliente':
      return clienteMenuItems;
    default:
      return [];
  }
}

// Función para obtener el título del dashboard según el rol
export function getDashboardTitle(role: 'admin' | 'asesor' | 'domiciliario' | 'cliente' | null): string {
  switch (role) {
    case 'admin':
      return 'Panel de Administrador';
    case 'asesor':
      return 'Panel de Asesor';
    case 'domiciliario':
      return 'Panel de Domiciliario';
    case 'cliente':
      return 'Mi Cuenta';
    default:
      return 'Dashboard';
  }
}

// Función para obtener el email según el rol
export function getUserEmailByRole(role: 'admin' | 'asesor' | 'domiciliario' | 'cliente' | null): string {
  switch (role) {
    case 'admin':
      return 'admin@surticamisetas.com';
    case 'asesor':
      return 'asesor@surticamisetas.com';
    case 'domiciliario':
      return 'domiciliario@surticamisetas.com';
    case 'cliente':
      return 'cliente@email.com';
    default:
      return '';
  }
}



