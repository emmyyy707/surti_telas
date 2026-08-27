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
  LayoutDashboard,
  UserCheck,
  ClipboardList,
  Warehouse,
  Truck as TruckIcon,
  CreditCard,
  FileText,
  Home,
  Star,
  RotateCw,
  CheckCircle,
  type LucideIcon as LucideIconType,
} from 'lucide-react';

export type ModuleCategory =
  | 'dashboard'
  | 'configuracion'
  | 'usuarios'
  | 'compras'
  | 'existencias'
  | 'produccion'
  | 'ventas'
  | 'reportes'
  | 'cliente'
  | 'domiciliario'
  | 'asesor';

export type PanelType = 'admin' | 'asesor' | 'domiciliario' | 'cliente';

export const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  dashboard: 'Dashboard',
  configuracion: 'Configuración',
  usuarios: 'Usuarios y Acceso',
  compras: 'Compras',
  existencias: 'Existencias',
  produccion: 'Producción',
  ventas: 'Ventas / Pedidos',
  reportes: 'Reportes',
  cliente: 'Cliente',
  domiciliario: 'Domiciliario',
  asesor: 'Asesor',
};

export interface SystemModule {
  key: string;
  name: string;
  description: string;
  category: ModuleCategory;
  panel: PanelType;
  permissionCodes: string[];
  readPermission: string;
  icon: LucideIconType;
  route: string;
  estado: 'ACTIVO' | 'INACTIVO';
}

export const SYSTEM_MODULES: SystemModule[] = [
  // ==================== ADMIN ====================
  // Dashboard
  {
    key: 'admin.dashboard',
    name: 'Dashboard',
    description: 'Panel principal de administración',
    category: 'dashboard',
    panel: 'admin',
    permissionCodes: ['admin:dashboard:read'],
    readPermission: 'admin:dashboard:read',
    icon: LayoutDashboard,
    route: '/admin/dashboard',
    estado: 'ACTIVO',
  },
  {
    key: 'admin.dashboard.analitico',
    name: 'Dashboard Analítico',
    description: 'Métricas y análisis avanzado',
    category: 'dashboard',
    panel: 'admin',
    permissionCodes: ['admin:dashboard:analitico:read'],
    readPermission: 'admin:dashboard:analitico:read',
    icon: BarChart3,
    route: '/admin/dashboard-analitico',
    estado: 'ACTIVO',
  },
  // Clientes
  {
    key: 'admin.clientes',
    name: 'Clientes',
    description: 'Gestión de clientes y cupos',
    category: 'ventas',
    panel: 'admin',
    permissionCodes: [
      'admin:clientes:read',
      'admin:clientes:create',
      'admin:clientes:update',
      'admin:clientes:delete',
    ],
    readPermission: 'admin:clientes:read',
    icon: Users,
    route: '/admin/clientes',
    estado: 'ACTIVO',
  },
  // Catálogo de Productos
  {
    key: 'admin.catalogo',
    name: 'Catálogo de Productos',
    description: 'Catálogo público de productos',
    category: 'existencias',
    panel: 'admin',
    permissionCodes: [
      'admin:catalogo:read',
      'admin:catalogo:update',
    ],
    readPermission: 'admin:catalogo:read',
    icon: Globe,
    route: '/admin/catalogo',
    estado: 'ACTIVO',
  },
  // Productos Terminados
  {
    key: 'admin.productos',
    name: 'Productos Terminados',
    description: 'Gestión de productos terminados',
    category: 'existencias',
    panel: 'admin',
    permissionCodes: [
      'admin:productos:read',
      'admin:productos:create',
      'admin:productos:update',
      'admin:productos:delete',
    ],
    readPermission: 'admin:productos:read',
    icon: PackageOpen,
    route: '/admin/productos',
    estado: 'ACTIVO',
  },
  // Categorías
  {
    key: 'admin.categorias',
    name: 'Categorías',
    description: 'Categorías de productos',
    category: 'existencias',
    panel: 'admin',
    permissionCodes: [
      'admin:categorias:read',
      'admin:categorias:create',
      'admin:categorias:update',
      'admin:categorias:delete',
    ],
    readPermission: 'admin:categorias:read',
    icon: FolderTree,
    route: '/admin/categorias',
    estado: 'ACTIVO',
  },
  // Pedidos
  {
    key: 'admin.pedidos',
    name: 'Pedidos',
    description: 'Gestión de pedidos',
    category: 'ventas',
    panel: 'admin',
    permissionCodes: [
      'admin:pedidos:read',
      'admin:pedidos:create',
      'admin:pedidos:update',
      'admin:pedidos:delete',
    ],
    readPermission: 'admin:pedidos:read',
    icon: ShoppingCart,
    route: '/admin/pedidos',
    estado: 'ACTIVO',
  },
  // Pedidos Personalizados
  {
    key: 'admin.pedidos.personalizados',
    name: 'Pedidos Personalizados',
    description: 'Gestión de pedidos de personalización',
    category: 'ventas',
    panel: 'admin',
    permissionCodes: [
      'admin:pedidos-personalizados:read',
      'admin:pedidos-personalizados:update',
      'admin:pedidos-personalizados:delete',
    ],
    readPermission: 'admin:pedidos-personalizados:read',
    icon: Scissors,
    route: '/admin/pedidos-personalizados',
    estado: 'ACTIVO',
  },
  // Producción
  {
    key: 'admin.produccion',
    name: 'Producción',
    description: 'Panel principal de producción',
    category: 'produccion',
    panel: 'admin',
    permissionCodes: ['admin:produccion:read'],
    readPermission: 'admin:produccion:read',
    icon: Factory,
    route: '/admin/produccion',
    estado: 'ACTIVO',
  },
  // Talleres
  {
    key: 'admin.talleres',
    name: 'Talleres',
    description: 'Registro y gestión de talleres',
    category: 'produccion',
    panel: 'admin',
    permissionCodes: [
      'admin:talleres:read',
      'admin:talleres:create',
      'admin:talleres:update',
      'admin:talleres:delete',
    ],
    readPermission: 'admin:talleres:read',
    icon: Factory,
    route: '/admin/talleres',
    estado: 'ACTIVO',
  },
  // Asignación de Producción
  {
    key: 'admin.produccion.asignacion',
    name: 'Asignación de Producción',
    description: 'Asignación de órdenes a talleres',
    category: 'produccion',
    panel: 'admin',
    permissionCodes: [
      'admin:produccion:asignacion:read',
      'admin:produccion:asignacion:create',
      'admin:produccion:asignacion:update',
    ],
    readPermission: 'admin:produccion:asignacion:read',
    icon: ClipboardList,
    route: '/admin/asignacion',
    estado: 'ACTIVO',
  },
  // Seguimiento de Producción
  {
    key: 'admin.produccion.seguimiento',
    name: 'Seguimiento de Producción',
    description: 'Seguimiento de órdenes de producción',
    category: 'produccion',
    panel: 'admin',
    permissionCodes: [
      'admin:produccion:seguimiento:read',
      'admin:produccion:seguimiento:update',
    ],
    readPermission: 'admin:produccion:seguimiento:read',
    icon: TrendingUp,
    route: '/admin/seguimiento',
    estado: 'ACTIVO',
  },
  // Control de Prendas
  {
    key: 'admin.prendas',
    name: 'Control de Prendas',
    description: 'Control de calidad de prendas',
    category: 'produccion',
    panel: 'admin',
    permissionCodes: [
      'admin:prendas:read',
      'admin:prendas:create',
      'admin:prendas:update',
    ],
    readPermission: 'admin:prendas:read',
    icon: CheckCircle,
    route: '/admin/prendas',
    estado: 'ACTIVO',
  },
  // Inventario
  {
    key: 'admin.inventario',
    name: 'Inventario',
    description: 'Gestión de inventario',
    category: 'existencias',
    panel: 'admin',
    permissionCodes: [
      'admin:inventario:read',
      'admin:inventario:create',
      'admin:inventario:update',
      'admin:inventario:delete',
    ],
    readPermission: 'admin:inventario:read',
    icon: Warehouse,
    route: '/admin/inventario',
    estado: 'ACTIVO',
  },
  // Insumos
  {
    key: 'admin.insumos',
    name: 'Insumos',
    description: 'Gestión de insumos y materiales',
    category: 'compras',
    panel: 'admin',
    permissionCodes: [
      'admin:insumos:read',
      'admin:insumos:create',
      'admin:insumos:update',
      'admin:insumos:delete',
    ],
    readPermission: 'admin:insumos:read',
    icon: Boxes,
    route: '/admin/insumos',
    estado: 'ACTIVO',
  },
  // Categorías de Insumos
  {
    key: 'admin.insumos.categorias',
    name: 'Categorías de Insumos',
    description: 'Categorías de insumos',
    category: 'compras',
    panel: 'admin',
    permissionCodes: [
      'admin:insumos:categorias:read',
      'admin:insumos:categorias:create',
      'admin:insumos:categorias:update',
    ],
    readPermission: 'admin:insumos:categorias:read',
    icon: FolderTree,
    route: '/admin/categorias-insumos',
    estado: 'ACTIVO',
  },
  // Proveedores
  {
    key: 'admin.proveedores',
    name: 'Proveedores',
    description: 'Gestión de proveedores',
    category: 'compras',
    panel: 'admin',
    permissionCodes: [
      'admin:proveedores:read',
      'admin:proveedores:create',
      'admin:proveedores:update',
      'admin:proveedores:delete',
    ],
    readPermission: 'admin:proveedores:read',
    icon: Truck,
    route: '/admin/proveedores',
    estado: 'ACTIVO',
  },
  // Compras
  {
    key: 'admin.compras',
    name: 'Compras',
    description: 'Gestión de órdenes de compra',
    category: 'compras',
    panel: 'admin',
    permissionCodes: [
      'admin:compras:read',
      'admin:compras:create',
      'admin:compras:update',
      'admin:compras:delete',
    ],
    readPermission: 'admin:compras:read',
    icon: ShoppingBag,
    route: '/admin/compras',
    estado: 'ACTIVO',
  },
  // Alertas de Stock
  {
    key: 'admin.alertas.stock',
    name: 'Alertas de Stock',
    description: 'Alertas de inventario bajo',
    category: 'existencias',
    panel: 'admin',
    permissionCodes: [
      'admin:alertas:stock:read',
      'admin:alertas:stock:update',
    ],
    readPermission: 'admin:alertas:stock:read',
    icon: AlertTriangle,
    route: '/admin/alertas-stock',
    estado: 'ACTIVO',
  },
  // Stock Devuelto
  {
    key: 'admin.stock.devuelto',
    name: 'Stock Devuelto',
    description: 'Gestión de stock devuelto',
    category: 'existencias',
    panel: 'admin',
    permissionCodes: [
      'admin:stock:devuelto:read',
      'admin:stock:devuelto:update',
    ],
    readPermission: 'admin:stock:devuelto:read',
    icon: RotateCcw,
    route: '/admin/stock-devuelto',
    estado: 'ACTIVO',
  },
  // Domicilios
  {
    key: 'admin.domicilios',
    name: 'Domicilios',
    description: 'Gestión de entregas',
    category: 'ventas',
    panel: 'admin',
    permissionCodes: [
      'admin:domicilios:read',
      'admin:domicilios:create',
      'admin:domicilios:update',
    ],
    readPermission: 'admin:domicilios:read',
    icon: MapPin,
    route: '/admin/domicilios',
    estado: 'ACTIVO',
  },
  // Ruta del Día
  {
    key: 'admin.ruta.dia',
    name: 'Ruta del Día',
    description: 'Planificación de ruta de reparto',
    category: 'ventas',
    panel: 'admin',
    permissionCodes: [
      'admin:ruta:dia:read',
      'admin:ruta:dia:update',
    ],
    readPermission: 'admin:ruta:dia:read',
    icon: TruckIcon,
    route: '/admin/ruta-del-dia',
    estado: 'ACTIVO',
  },
  // Asesores
  {
    key: 'admin.asesores',
    name: 'Asesores',
    description: 'Gestión de usuarios asesores',
    category: 'usuarios',
    panel: 'admin',
    permissionCodes: [
      'admin:asesores:read',
      'admin:asesores:create',
      'admin:asesores:update',
      'admin:asesores:delete',
    ],
    readPermission: 'admin:asesores:read',
    icon: UserCheck,
    route: '/admin/asesores',
    estado: 'ACTIVO',
  },
  // Gestión de Ventas
  {
    key: 'admin.ventas',
    name: 'Gestión de Ventas',
    description: 'Gestión de ventas y facturas',
    category: 'ventas',
    panel: 'admin',
    permissionCodes: [
      'admin:ventas:read',
      'admin:ventas:create',
      'admin:ventas:update',
    ],
    readPermission: 'admin:ventas:read',
    icon: TrendingUp,
    route: '/admin/gestion-ventas',
    estado: 'ACTIVO',
  },
  // Facturación/Recibos
  {
    key: 'admin.facturacion',
    name: 'Facturación',
    description: 'Emisión y gestión de recibos',
    category: 'ventas',
    panel: 'admin',
    permissionCodes: [
      'admin:facturacion:read',
      'admin:facturacion:create',
      'admin:facturacion:update',
      'admin:facturacion:delete',
    ],
    readPermission: 'admin:facturacion:read',
    icon: Receipt,
    route: '/admin/facturacion',
    estado: 'ACTIVO',
  },
  // Pagos
  {
    key: 'admin.pagos',
    name: 'Pagos',
    description: 'Gestión de pagos de pedidos',
    category: 'ventas',
    panel: 'admin',
    permissionCodes: [
      'admin:pagos:read',
      'admin:pagos:create',
      'admin:pagos:update',
      'admin:pagos:delete',
    ],
    readPermission: 'admin:pagos:read',
    icon: CreditCard,
    route: '/admin/pagos',
    estado: 'ACTIVO',
  },
  // Abonos
  {
    key: 'admin.abonos',
    name: 'Abonos',
    description: 'Gestión de abonos a pedidos',
    category: 'ventas',
    panel: 'admin',
    permissionCodes: [
      'admin:abonos:read',
      'admin:abonos:create',
      'admin:abonos:update',
    ],
    readPermission: 'admin:abonos:read',
    icon: DollarSign,
    route: '/admin/abonos',
    estado: 'ACTIVO',
  },
  // Reportes
  {
    key: 'admin.reportes',
    name: 'Reportes',
    description: 'Panel principal de reportes',
    category: 'reportes',
    panel: 'admin',
    permissionCodes: ['admin:reportes:read'],
    readPermission: 'admin:reportes:read',
    icon: BarChart3,
    route: '/admin/reportes',
    estado: 'ACTIVO',
  },
  {
    key: 'admin.reportes.ventas',
    name: 'Reportes de Ventas',
    description: 'Reportes de ventas',
    category: 'reportes',
    panel: 'admin',
    permissionCodes: ['admin:reportes:ventas:read'],
    readPermission: 'admin:reportes:ventas:read',
    icon: TrendingUp,
    route: '/admin/reportes/ventas',
    estado: 'ACTIVO',
  },
  {
    key: 'admin.reportes.finanzas',
    name: 'Reportes de Finanzas',
    description: 'Reportes financieros',
    category: 'reportes',
    panel: 'admin',
    permissionCodes: ['admin:reportes:finanzas:read'],
    readPermission: 'admin:reportes:finanzas:read',
    icon: DollarSign,
    route: '/admin/reportes/finanzas',
    estado: 'ACTIVO',
  },
  {
    key: 'admin.reportes.usuarios',
    name: 'Reportes de Usuarios',
    description: 'Reportes de usuarios y actividad',
    category: 'reportes',
    panel: 'admin',
    permissionCodes: ['admin:reportes:usuarios:read'],
    readPermission: 'admin:reportes:usuarios:read',
    icon: Users,
    route: '/admin/reportes/usuarios',
    estado: 'ACTIVO',
  },
  {
    key: 'admin.reportes.produccion',
    name: 'Reportes de Producción',
    description: 'Reportes de producción',
    category: 'reportes',
    panel: 'admin',
    permissionCodes: ['admin:reportes:produccion:read'],
    readPermission: 'admin:reportes:produccion:read',
    icon: Factory,
    route: '/admin/reportes/produccion',
    estado: 'ACTIVO',
  },
  {
    key: 'admin.reportes.inventario',
    name: 'Reportes de Inventario',
    description: 'Reportes de inventario',
    category: 'reportes',
    panel: 'admin',
    permissionCodes: ['admin:reportes:inventario:read'],
    readPermission: 'admin:reportes:inventario:read',
    icon: Warehouse,
    route: '/admin/reportes/inventario',
    estado: 'ACTIVO',
  },
  // Notificaciones
  {
    key: 'admin.notificaciones',
    name: 'Notificaciones',
    description: 'Gestión de notificaciones del sistema',
    category: 'configuracion',
    panel: 'admin',
    permissionCodes: [
      'admin:notificaciones:read',
      'admin:notificaciones:update',
    ],
    readPermission: 'admin:notificaciones:read',
    icon: Bell,
    route: '/admin/notificaciones',
    estado: 'ACTIVO',
  },
  // Portal del Cliente
  {
    key: 'admin.portal.cliente',
    name: 'Portal del Cliente',
    description: 'Configuración del portal de clientes',
    category: 'configuracion',
    panel: 'admin',
    permissionCodes: [
      'admin:portal:cliente:read',
      'admin:portal:cliente:update',
    ],
    readPermission: 'admin:portal:cliente:read',
    icon: Globe,
    route: '/admin/portal-cliente',
    estado: 'ACTIVO',
  },
  // Gestión de Usuarios
  {
    key: 'admin.usuarios',
    name: 'Gestión de Usuarios',
    description: 'Gestión general de usuarios',
    category: 'usuarios',
    panel: 'admin',
    permissionCodes: [
      'admin:usuarios:read',
      'admin:usuarios:create',
      'admin:usuarios:update',
      'admin:usuarios:delete',
    ],
    readPermission: 'admin:usuarios:read',
    icon: Users,
    route: '/admin/gestion-usuarios',
    estado: 'ACTIVO',
  },
  // Empleados
  {
    key: 'admin.empleados',
    name: 'Empleados',
    description: 'Gestión de empleados',
    category: 'usuarios',
    panel: 'admin',
    permissionCodes: [
      'admin:empleados:read',
      'admin:empleados:create',
      'admin:empleados:update',
      'admin:empleados:delete',
    ],
    readPermission: 'admin:empleados:read',
    icon: UserCog,
    route: '/admin/empleados',
    estado: 'ACTIVO',
  },
  // Roles y Permisos
  {
    key: 'admin.roles.permisos',
    name: 'Roles y Permisos',
    description: 'Gestión de roles y permisos',
    category: 'configuracion',
    panel: 'admin',
    permissionCodes: [
      'admin:roles:read',
      'admin:roles:create',
      'admin:roles:update',
      'admin:roles:delete',
    ],
    readPermission: 'admin:roles:read',
    icon: Shield,
    route: '/admin/gestion-roles-permisos',
    estado: 'ACTIVO',
  },
  // Seguridad
  {
    key: 'admin.seguridad',
    name: 'Seguridad',
    description: 'Seguridad de usuarios y acceso',
    category: 'configuracion',
    panel: 'admin',
    permissionCodes: [
      'admin:seguridad:read',
      'admin:seguridad:update',
    ],
    readPermission: 'admin:seguridad:read',
    icon: Shield,
    route: '/admin/seguridad',
    estado: 'ACTIVO',
  },
  // Gestión de Acceso
  {
    key: 'admin.acceso',
    name: 'Gestión de Acceso',
    description: 'Configuración de acceso de usuarios',
    category: 'configuracion',
    panel: 'admin',
    permissionCodes: [
      'admin:acceso:read',
      'admin:acceso:update',
    ],
    readPermission: 'admin:acceso:read',
    icon: Shield,
    route: '/admin/gestion-acceso',
    estado: 'ACTIVO',
  },
  // Configuración
  {
    key: 'admin.configuracion',
    name: 'Configuración',
    description: 'Configuración general del sistema',
    category: 'configuracion',
    panel: 'admin',
    permissionCodes: [
      'admin:configuracion:read',
      'admin:configuracion:update',
    ],
    readPermission: 'admin:configuracion:read',
    icon: Settings,
    route: '/admin/configuracion',
    estado: 'ACTIVO',
  },

  // ==================== ASESOR ====================
  {
    key: 'asesor.dashboard',
    name: 'Dashboard',
    description: 'Panel principal del asesor',
    category: 'dashboard',
    panel: 'asesor',
    permissionCodes: ['asesor:dashboard:read'],
    readPermission: 'asesor:dashboard:read',
    icon: LayoutDashboard,
    route: '/asesor/dashboard',
    estado: 'ACTIVO',
  },
  {
    key: 'asesor.clientes',
    name: 'Clientes',
    description: 'Clientes del asesor',
    category: 'ventas',
    panel: 'asesor',
    permissionCodes: [
      'asesor:clientes:read',
      'asesor:clientes:create',
      'asesor:clientes:update',
    ],
    readPermission: 'asesor:clientes:read',
    icon: Users,
    route: '/asesor/clientes',
    estado: 'ACTIVO',
  },
  {
    key: 'asesor.pedidos',
    name: 'Pedidos',
    description: 'Pedidos del asesor',
    category: 'ventas',
    panel: 'asesor',
    permissionCodes: [
      'asesor:pedidos:read',
      'asesor:pedidos:create',
      'asesor:pedidos:update',
    ],
    readPermission: 'asesor:pedidos:read',
    icon: ShoppingCart,
    route: '/asesor/pedidos',
    estado: 'ACTIVO',
  },
  {
    key: 'asesor.catalogo',
    name: 'Catálogo',
    description: 'Catálogo de productos',
    category: 'ventas',
    panel: 'asesor',
    permissionCodes: ['asesor:catalogo:read'],
    readPermission: 'asesor:catalogo:read',
    icon: PackageOpen,
    route: '/asesor/catalogo',
    estado: 'ACTIVO',
  },
  {
    key: 'asesor.comisiones',
    name: 'Comisiones',
    description: 'Comisiones del asesor',
    category: 'reportes',
    panel: 'asesor',
    permissionCodes: ['asesor:comisiones:read'],
    readPermission: 'asesor:comisiones:read',
    icon: DollarSign,
    route: '/asesor/comisiones',
    estado: 'ACTIVO',
  },
  {
    key: 'asesor.perfil',
    name: 'Perfil',
    description: 'Perfil del asesor',
    category: 'configuracion',
    panel: 'asesor',
    permissionCodes: [
      'asesor:perfil:read',
      'asesor:perfil:update',
    ],
    readPermission: 'asesor:perfil:read',
    icon: UserCog,
    route: '/asesor/perfil',
    estado: 'ACTIVO',
  },

  // ==================== DOMICILIARIO ====================
  {
    key: 'domiciliario.dashboard',
    name: 'Dashboard',
    description: 'Panel principal del domiciliario',
    category: 'dashboard',
    panel: 'domiciliario',
    permissionCodes: ['domiciliario:dashboard:read'],
    readPermission: 'domiciliario:dashboard:read',
    icon: LayoutDashboard,
    route: '/domiciliario/dashboard',
    estado: 'ACTIVO',
  },
  {
    key: 'domiciliario.entregas',
    name: 'Entregas',
    description: 'Entregas asignadas',
    category: 'ventas',
    panel: 'domiciliario',
    permissionCodes: [
      'domiciliario:entregas:read',
      'domiciliario:entregas:update',
    ],
    readPermission: 'domiciliario:entregas:read',
    icon: Truck,
    route: '/domiciliario/entregas',
    estado: 'ACTIVO',
  },
  {
    key: 'domiciliario.ruta',
    name: 'Ruta del Día',
    description: 'Ruta de reparto del día',
    category: 'ventas',
    panel: 'domiciliario',
    permissionCodes: ['domiciliario:ruta:read'],
    readPermission: 'domiciliario:ruta:read',
    icon: MapPin,
    route: '/domiciliario/ruta',
    estado: 'ACTIVO',
  },
  {
    key: 'domiciliario.historial',
    name: 'Historial',
    description: 'Historial de entregas',
    category: 'reportes',
    panel: 'domiciliario',
    permissionCodes: ['domiciliario:historial:read'],
    readPermission: 'domiciliario:historial:read',
    icon: FileText,
    route: '/domiciliario/historial',
    estado: 'ACTIVO',
  },
  {
    key: 'domiciliario.perfil',
    name: 'Perfil',
    description: 'Perfil del domiciliario',
    category: 'configuracion',
    panel: 'domiciliario',
    permissionCodes: [
      'domiciliario:perfil:read',
      'domiciliario:perfil:update',
    ],
    readPermission: 'domiciliario:perfil:read',
    icon: UserCog,
    route: '/domiciliario/perfil',
    estado: 'ACTIVO',
  },

  // ==================== CLIENTE ====================
  {
    key: 'cliente.inicio',
    name: 'Inicio',
    description: 'Página de inicio del cliente',
    category: 'dashboard',
    panel: 'cliente',
    permissionCodes: ['cliente:inicio:read'],
    readPermission: 'cliente:inicio:read',
    icon: Home,
    route: '/cliente/inicio',
    estado: 'ACTIVO',
  },
  {
    key: 'cliente.pedidos',
    name: 'Mis Pedidos',
    description: 'Pedidos del cliente',
    category: 'ventas',
    panel: 'cliente',
    permissionCodes: [
      'cliente:pedidos:read',
      'cliente:pedidos:create',
    ],
    readPermission: 'cliente:pedidos:read',
    icon: ShoppingCart,
    route: '/cliente/pedidos',
    estado: 'ACTIVO',
  },
  {
    key: 'cliente.pedidos.crear',
    name: 'Crear Pedido',
    description: 'Crear nuevo pedido',
    category: 'ventas',
    panel: 'cliente',
    permissionCodes: ['cliente:pedidos:create'],
    readPermission: 'cliente:pedidos:create',
    icon: ShoppingCart,
    route: '/cliente/pedidos/crear',
    estado: 'ACTIVO',
  },
  {
    key: 'cliente.pedidos.personalizados',
    name: 'Pedidos Personalizados',
    description: 'Pedidos personalizados del cliente',
    category: 'ventas',
    panel: 'cliente',
    permissionCodes: [
      'cliente:pedidos:personalizados:read',
      'cliente:pedidos:personalizados:create',
    ],
    readPermission: 'cliente:pedidos:personalizados:read',
    icon: Scissors,
    route: '/cliente/pedidos-personalizados',
    estado: 'ACTIVO',
  },
  {
    key: 'cliente.recibos',
    name: 'Recibos',
    description: 'Recibos del cliente',
    category: 'ventas',
    panel: 'cliente',
    permissionCodes: ['cliente:recibos:read'],
    readPermission: 'cliente:recibos:read',
    icon: Receipt,
    route: '/cliente/recibos',
    estado: 'ACTIVO',
  },
  {
    key: 'cliente.favoritos',
    name: 'Favoritos',
    description: 'Productos favoritos',
    category: 'cliente',
    panel: 'cliente',
    permissionCodes: [
      'cliente:favoritos:read',
      'cliente:favoritos:update',
    ],
    readPermission: 'cliente:favoritos:read',
    icon: Star,
    route: '/cliente/favoritos',
    estado: 'ACTIVO',
  },
  {
    key: 'cliente.seguimiento',
    name: 'Seguimiento',
    description: 'Seguimiento de pedidos',
    category: 'ventas',
    panel: 'cliente',
    permissionCodes: ['cliente:seguimiento:read'],
    readPermission: 'cliente:seguimiento:read',
    icon: MapPin,
    route: '/cliente/seguimiento',
    estado: 'ACTIVO',
  },
  {
    key: 'cliente.perfil',
    name: 'Perfil',
    description: 'Perfil del cliente',
    category: 'configuracion',
    panel: 'cliente',
    permissionCodes: [
      'cliente:perfil:read',
      'cliente:perfil:update',
    ],
    readPermission: 'cliente:perfil:read',
    icon: UserCog,
    route: '/cliente/perfil',
    estado: 'ACTIVO',
  },
  {
    key: 'cliente.devoluciones',
    name: 'Reportar Devolución',
    description: 'Reportar devolución de pedido',
    category: 'cliente',
    panel: 'cliente',
    permissionCodes: [
      'cliente:devoluciones:read',
      'cliente:devoluciones:create',
    ],
    readPermission: 'cliente:devoluciones:read',
    icon: RotateCw,
    route: '/cliente/reportar-devolucion',
    estado: 'ACTIVO',
  },
  // Devoluciones Admin
  {
    key: 'admin.devoluciones',
    name: 'Devoluciones',
    description: 'Gestión de devoluciones de productos',
    category: 'ventas',
    panel: 'admin',
    permissionCodes: [
      'admin:devoluciones:read',
      'admin:devoluciones:update',
    ],
    readPermission: 'admin:devoluciones:read',
    icon: RotateCw,
    route: '/admin/devoluciones',
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

export const MODULE_READ_PERMISSIONS: Record<string, string> = SYSTEM_MODULES.reduce(
  (acc, m) => {
    acc[m.key] = m.readPermission;
    return acc;
  },
  {} as Record<string, string>,
);

export const ALL_PERMISSION_CODES: string[] = SYSTEM_MODULES.flatMap((m) => m.permissionCodes);

export const ALL_MODULE_KEYS: string[] = SYSTEM_MODULES.map((m) => m.key);

export function getModulesByPanel(panel: PanelType): SystemModule[] {
  return SYSTEM_MODULES.filter((m) => m.panel === panel);
}

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
    cliente: [],
    domiciliario: [],
    asesor: [],
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

export function getModulesGroupedByPanel(): Record<PanelType, SystemModule[]> {
  return {
    admin: SYSTEM_MODULES.filter((m) => m.panel === 'admin'),
    asesor: SYSTEM_MODULES.filter((m) => m.panel === 'asesor'),
    domiciliario: SYSTEM_MODULES.filter((m) => m.panel === 'domiciliario'),
    cliente: SYSTEM_MODULES.filter((m) => m.panel === 'cliente'),
  };
}
