export interface AnalyticsFilters {
  desde?: string;
  hasta?: string;
  asesorId?: string;
  clienteId?: string;
  estado?: string;
  tipoFlujo?: string;
  page?: number;
  limit?: number;
}

export interface DailySales {
  fecha: string;
  cantidad: number;
  total: number;
}

export interface MonthlySales {
  mes: string;
  ventas: number;
  total: number;
}

export interface SalesByStatus {
  estado: string;
  cantidad: number;
  total: number;
}

export interface TopProduct {
  nombre: string;
  cantidad: number;
  total: number;
}

export interface TopCustomer {
  cliente: string;
  cantidad: number;
  total: number;
}

export interface SalesByAsesor {
  asesorId: string;
  asesorNombre: string;
  cantidad: number;
  total: number;
}

export interface KPISales {
  totalVentas: number;
  totalPedidos: number;
  totalClientes: number;
  ticketPromedio: number;
  tasaAprobacion: number;
  tasaRechazo: number;
}

export interface KPIData {
  totalPedidos: number;
  totalVentas: number;
  totalClientes: number;
  ingresosTotales: number;
  ticketPromedio: number;
  pedidosPorEstado: Array<{ estado: string; cantidad: number }>;
  ventasPorAsesor: Array<{ asesorId: string; total: number; cantidad: number }>;
  tendenciaDiaria: DailySales[];
  topProductos: TopProduct[];
  topClientes: TopCustomer[];
}

export interface TrendData {
  fecha: string;
  ventas: number;
  total: number;
}

export interface FinancialReport {
  ingresosTotales: number;
  gastosTotales: number;
  utilidadNeta: number;
  margenUtilidad: number;
  cuentasPorCobrar: number;
  cuentasPorPagar: number;
  flujoCaja: number;
  ventasPorCategoria: Array<{ categoria: string; total: number }>;
  ventasPorAsesor: Array<{ asesor: string; total: number; comision: number }>;
  ventasPorProducto: Array<{ producto: string; total: number; cantidad: number }>;
}