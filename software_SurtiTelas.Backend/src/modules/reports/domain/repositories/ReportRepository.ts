import { DateRangeFilter } from '../../application/use-cases/GetSalesReport';

export interface SalesReport {
  totalSales: number;
  totalOrders: number;
  ordersByStatus: { estado: string; cantidad: number }[];
  topProducts: { productId: string; nombre: string; cantidad: number; total: number }[];
  salesByAsesor: { asesorId: string; asesorNombre: string; total: number; ordenes: number }[];
}

export interface InventoryReport {
  totalProducts: number;
  lowStock: number;
  agotado: number;
  stockMovements: { tipo: string; cantidad: number; movimientos: number }[];
  categories: { categoriaId: string | null; nombre: string | null; productos: number }[];
}

export interface ProductionReport {
  totalOrders: number;
  ordersByEstado: { estado: string; cantidad: number }[];
  avancePromedio: number;
  tardios: number;
  porTaller: { tallerId: string | null; nombre: string | null; ordenes: number; avancePromedio: number }[];
}

export interface UsersReport {
  totalUsers: number;
  byRole: { role: string; cantidad: number }[];
  active: number;
  inactive: number;
  recentRegistrations: { id: string; nombre: string; email: string; role: string; createdAt: Date }[];
}

export interface ReportRepository {
  getSalesReport(range?: DateRangeFilter): Promise<SalesReport>;
  getInventoryReport(): Promise<InventoryReport>;
  getProductionReport(): Promise<ProductionReport>;
  getUsersReport(range?: DateRangeFilter): Promise<UsersReport>;
}
