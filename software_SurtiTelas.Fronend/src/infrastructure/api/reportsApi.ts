import { api } from './httpClient';

export interface SalesReportFilters {
  from?: string;
  to?: string;
  asesorId?: string;
}

export interface SalesReport {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageTicket: number;
  salesByStatus: { estado: string; cantidad: number; total: number }[];
  topProducts: { nombre: string; cantidad: number; total: number }[];
  salesByAsesor: { asesor?: string; asesorNombre?: string; cantidad: number; total: number }[];
  monthlyTrend: { mes: string; ventas: number; pedidos: number }[];
}

export interface InventoryReport {
  totalProducts: number;
  totalStock?: number;
  lowStockProducts?: number;
  outOfStockProducts?: number;
  lowStock?: number;
  agotado?: number;
  stockByCategory?: { categoria: string; cantidad: number; productos: number }[];
  categories?: { categoriaId: string | null; nombre: string | null; productos: number }[];
  recentMovements?: { id: string; tipo: string; cantidad: number; motivo?: string; fecha?: string }[];
  stockMovements?: { tipo: string; cantidad: number; movimientos: number }[];
}

export interface ProductionReport {
  totalOrders: number;
  ordersByStatus?: { estado: string; cantidad: number }[];
  ordersByEstado?: { estado: string; cantidad: number }[];
  averageProgress?: number;
  avancePromedio?: number;
  lateOrders?: number;
  tardios?: number;
  ordersByWorkshop?: { taller: string; cantidad: number }[];
  porTaller?: { tallerId: string | null; nombre: string | null; ordenes: number; avancePromedio: number }[];
  recentOrders?: { id: string; referencia: string; avance?: number; estado: string; fechaEstimada?: string }[];
}

export interface UsersReport {
  totalUsers: number;
  usersByRole: { role: string; cantidad: number }[];
  activeUsers: number;
  inactiveUsers: number;
  recentUsers: { id: string; nombre: string; email: string; role: string; fechaRegistro: string }[];
}

export interface Report {
  id: string;
  tipo: string;
  titulo: string;
  descripcion?: string;
  datos: Record<string, unknown>;
  fechaInicio?: string;
  fechaFin?: string;
  creadoPor?: string;
  createdAt: string;
}

function toReport(tipo: string, data: Record<string, unknown>): Report {
  let titulo = tipo;
  let descripcion: string | undefined;
  let creadoPor: string | undefined;

  switch (tipo) {
    case 'sales': {
      titulo = 'Ventas por Periodo';
      const totalSales = data.totalSales as number | undefined;
      const totalOrders = data.totalOrders as number | undefined;
      descripcion = totalSales !== undefined
        ? `Total: $${Math.round(totalSales).toLocaleString('es-CO')} · ${totalOrders ?? 0} pedidos`
        : undefined;
      break;
    }
    case 'inventory': {
      titulo = 'Inventario por Categoría';
      const totalProducts = data.totalProducts as number | undefined;
      descripcion = totalProducts !== undefined ? `${totalProducts} productos registrados` : undefined;
      break;
    }
    case 'production': {
      titulo = 'Producción';
      const totalProdOrders = data.totalOrders as number | undefined;
      descripcion = totalProdOrders !== undefined ? `${totalProdOrders} órdenes de producción` : undefined;
      break;
    }
    case 'users': {
      titulo = 'Usuarios del Sistema';
      const totalUsers = data.totalUsers as number | undefined;
      descripcion = totalUsers !== undefined ? `${totalUsers} usuarios registrados` : undefined;
      break;
    }
  }

  return {
    id: `RPT-${tipo.toUpperCase()}`,
    tipo,
    titulo,
    descripcion,
    datos: data,
    creadoPor,
    createdAt: new Date().toISOString(),
  };
}

export const reportsApi = {
  async list(): Promise<Report[]> {
    const [sales, inventory, production, users] = await Promise.all([
      reportsApi.getSalesReport(),
      reportsApi.getInventoryReport(),
      reportsApi.getProductionReport(),
      reportsApi.getUsersReport(),
    ]);

    const reports: Report[] = [];
    if (sales) reports.push(toReport('sales', sales as unknown as Record<string, unknown>));
    if (inventory) reports.push(toReport('inventory', inventory as unknown as Record<string, unknown>));
    if (production) reports.push(toReport('production', production as unknown as Record<string, unknown>));
    if (users) reports.push(toReport('users', users as unknown as Record<string, unknown>));

    return reports;
  },

  async getSalesReport(filters?: Record<string, string | number | boolean | undefined | null>): Promise<SalesReport> {
    const response = await api.get<SalesReport>('/reports/sales', { query: filters });
    return response ?? {
      totalSales: 0,
      totalOrders: 0,
      totalCustomers: 0,
      averageTicket: 0,
      salesByStatus: [],
      topProducts: [],
      salesByAsesor: [],
      monthlyTrend: [],
    };
  },

  async getInventoryReport(): Promise<InventoryReport> {
    const response = await api.get<InventoryReport>('/reports/inventory');
    return response ?? {
      totalProducts: 0,
      totalStock: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      stockByCategory: [],
      recentMovements: [],
    };
  },

  async getProductionReport(): Promise<ProductionReport> {
    const response = await api.get<ProductionReport>('/reports/production');
    return response ?? {
      totalOrders: 0,
      ordersByStatus: [],
      averageProgress: 0,
      lateOrders: 0,
      ordersByWorkshop: [],
      recentOrders: [],
    };
  },

  async getUsersReport(): Promise<UsersReport> {
    const response = await api.get<UsersReport>('/reports/users');
    return response ?? {
      totalUsers: 0,
      usersByRole: [],
      activeUsers: 0,
      inactiveUsers: 0,
      recentUsers: [],
    };
  },
};
