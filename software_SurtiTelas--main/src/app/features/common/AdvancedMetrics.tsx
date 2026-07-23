import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Activity,
  Target,
  BarChart3,
  Percent,
  Calendar,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

function MetricCard({ title, value, change, icon, description, trend }: MetricCardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const trendBg = trend === 'up' ? 'bg-green-100' : trend === 'down' ? 'bg-red-100' : 'bg-gray-100';

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <h3 className="text-3xl mb-2">{value}</h3>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4" />
              ) : trend === 'down' ? (
                <TrendingDown className="h-4 w-4" />
              ) : null}
              <span>{change > 0 ? '+' : ''}{change}%</span>
              <span className="text-gray-500 ml-1">vs mes anterior</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${trendBg}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

interface AdvancedMetricsProps {
  salesData: any[];
  monthlySalesData: any[];
  products: any[];
  orders: any[];
  customers: any[];
}

export function AdvancedMetrics({
  salesData,
  monthlySalesData,
  products,
  orders,
  customers,
}: AdvancedMetricsProps) {
  // Calcular métricas avanzadas
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= 10).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  const activeCustomers = customers.filter(c => c.status === 'activo').length;

  // Calcular tasa de conversión (simulada)
  const conversionRate = 3.2;
  const repeatCustomerRate = 45.8;

  // Datos para el gráfico de radar (rendimiento por categoría)
  const categoryPerformance = [
    { category: 'Ventas', value: 85 },
    { category: 'Inventario', value: 70 },
    { category: 'Clientes', value: 90 },
    { category: 'Entregas', value: 75 },
    { category: 'Satisfacción', value: 88 },
  ];

  // Datos de comparación mes a mes
  const monthlyComparison = monthlySalesData.slice(-6).map((data, index, arr) => {
    const prevValue = index > 0 ? arr[index - 1].ventas : data.ventas;
    const change = prevValue > 0 ? ((data.ventas - prevValue) / prevValue) * 100 : 0;
    return {
      ...data,
      cambio: change,
    };
  });

  // Datos de productos más vendidos
  const topProducts = [
    { name: 'Camiseta Básica Adulto', sold: 145, revenue: 2175000 },
    { name: 'Camiseta Deportiva', sold: 98, revenue: 1470000 },
    { name: 'Camiseta Infantil', sold: 87, revenue: 783000 },
    { name: 'Polo Empresarial', sold: 76, revenue: 1520000 },
    { name: 'Camiseta Técnica', sold: 65, revenue: 1300000 },
  ];

  // Datos de estado de pedidos
  const orderStatusData = [
    { name: 'Completados', value: orders.filter(o => o.status === 'completado').length, color: '#22c55e' },
    { name: 'En Proceso', value: orders.filter(o => o.status === 'en_proceso').length, color: '#3b82f6' },
    { name: 'Pendientes', value: orders.filter(o => o.status === 'pendiente').length, color: '#f59e0b' },
    { name: 'Cancelados', value: orders.filter(o => o.status === 'cancelado').length, color: '#ef4444' },
  ];

  // Datos de horarios pico de ventas (simulado)
  const hourlyData = [
    { hour: '6-8', sales: 5 },
    { hour: '8-10', sales: 15 },
    { hour: '10-12', sales: 28 },
    { hour: '12-14', sales: 35 },
    { hour: '14-16', sales: 42 },
    { hour: '16-18', sales: 38 },
    { hour: '18-20', sales: 25 },
    { hour: '20-22', sales: 12 },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Ingresos Totales"
          value={`$${Math.round(totalRevenue / 1000)}K`}
          change={12.5}
          trend="up"
          icon={<DollarSign className="h-6 w-6 text-green-600" />}
        />
        <MetricCard
          title="Pedidos Totales"
          value={totalOrders}
          change={8.3}
          trend="up"
          icon={<ShoppingCart className="h-6 w-6 text-blue-600" />}
        />
        <MetricCard
          title="Clientes Activos"
          value={activeCustomers}
          change={5.7}
          trend="up"
          icon={<Users className="h-6 w-6 text-purple-600" />}
        />
        <MetricCard
          title="Valor Promedio Pedido"
          value={`$${Math.round(averageOrderValue / 1000)}K`}
          change={3.2}
          trend="up"
          icon={<Target className="h-6 w-6 text-orange-600" />}
        />
      </div>

      {/* Métricas Secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Tasa de Conversión"
          value={`${conversionRate}%`}
          change={0.8}
          trend="up"
          icon={<Percent className="h-6 w-6 text-indigo-600" />}
          description="Visitantes que compran"
        />
        <MetricCard
          title="Clientes Recurrentes"
          value={`${repeatCustomerRate}%`}
          change={2.3}
          trend="up"
          icon={<Activity className="h-6 w-6 text-pink-600" />}
          description="Compran más de una vez"
        />
        <MetricCard
          title="Stock Bajo"
          value={lowStockProducts}
          change={-5.0}
          trend="down"
          icon={<Package className="h-6 w-6 text-yellow-600" />}
          description="Productos bajo mínimo"
        />
        <MetricCard
          title="Sin Stock"
          value={outOfStockProducts}
          change={-12.0}
          trend="down"
          icon={<Package className="h-6 w-6 text-red-600" />}
          description="Productos agotados"
        />
      </div>

      {/* Gráficos Avanzados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparación Mensual */}
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Crecimiento Mensual
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyComparison}>
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000000" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid key="grid-advanced-area" strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis key="xaxis-advanced-area" dataKey="mes" stroke="#6b6b6b" />
              <YAxis key="yaxis-advanced-area" stroke="#6b6b6b" />
              <Tooltip
                key="tooltip-advanced-area"
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                }}
              />
              <Area
                key="area-ventas"
                type="monotone"
                dataKey="ventas"
                stroke="#000000"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorVentas)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Rendimiento por Categoría (Radar) */}
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Rendimiento por Categoría
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={categoryPerformance}>
              <PolarGrid stroke="#e5e5e5" />
              <PolarAngleAxis dataKey="category" stroke="#6b6b6b" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b6b6b" />
              <Radar
                name="Rendimiento"
                dataKey="value"
                stroke="#000000"
                fill="#000000"
                fillOpacity={0.3}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribución de Estado de Pedidos */}
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Estado de Pedidos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Horarios Pico de Ventas */}
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horarios Pico de Ventas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid key="grid-advanced-bar" strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis key="xaxis-advanced-bar" dataKey="hour" stroke="#6b6b6b" />
              <YAxis key="yaxis-advanced-bar" stroke="#6b6b6b" />
              <Tooltip
                key="tooltip-advanced-bar"
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                }}
              />
              <Bar key="bar-sales" dataKey="sales" fill="#000000" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tabla de Productos Más Vendidos */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top 5 Productos Más Vendidos
        </h3>
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Badge className="bg-black text-white">#{index + 1}</Badge>
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.sold} unidades vendidas</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">${product.revenue.toLocaleString('es-CO')}</p>
                <p className="text-sm text-gray-600">Ingresos</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}




