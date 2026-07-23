// Dashboard-specific types
export interface DashboardMetrics {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalClients: number;
  salesGrowth: number;
  ordersGrowth: number;
}

export interface SalesMetrics {
  date: string;
  amount: number;
  orders: number;
}

export interface ProductionMetrics {
  totalOrders: number;
  inProgress: number;
  completed: number;
  pending: number;
  averageTime: string;
}

export interface OrderMetrics {
  pending: number;
  inProgress: number;
  completedToday: number;
  cancelled: number;
}

export interface InventoryMetrics {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

export interface DeliveryMetrics {
  pending: number;
  inTransit: number;
  deliveredToday: number;
  returned: number;
}

export interface FinancialMetrics {
  revenue: number;
  expenses: number;
  profit: number;
  pendingPayments: number;
}

export interface WorkshopStatus {
  id: string;
  name: string;
  status: 'activo' | 'inactivo';
  currentOrders: number;
  capacity: number;
}

export interface InventoryAlert {
  id: string;
  productName: string;
  currentStock: number;
  minStock: number;
  severity: 'low' | 'medium' | 'high';
}

export interface OrderSummary {
  id: string;
  clientName: string;
  status: string;
  total: number;
  date: string;
}

export interface ProductionOrder {
  id: string;
  productName: string;
  quantity: number;
  workshop: string;
  status: string;
  deadline: string;
}

export interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

export interface TopClient {
  name: string;
  orders: number;
  totalSpent: number;
}

export interface ActivityItem {
  id: string;
  type: 'order' | 'payment' | 'production' | 'delivery';
  description: string;
  date: string;
  user?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface RevenueChartData {
  date: string;
  ingresos: number;
  gastos: number;
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  date: string;
  read: boolean;
}



