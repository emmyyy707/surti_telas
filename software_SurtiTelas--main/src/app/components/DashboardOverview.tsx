import { useState } from 'react';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AdvancedMetrics } from './AdvancedMetrics';
import { InventoryAlerts } from './InventoryAlerts';
import { ActivityTimeline, TimelineActivity } from './ActivityTimeline';
import { QuickActions } from './QuickActions';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  BarChart3, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  Calendar,
  Download,
} from 'lucide-react';

interface DashboardOverviewProps {
  salesData: any[];
  monthlySalesData: any[];
  products: any[];
  orders: any[];
  customers: any[];
  activities?: TimelineActivity[];
  onCreateProduct?: () => void;
  onCreateOrder?: () => void;
  onCreateCustomer?: () => void;
  onCreateWorkshop?: () => void;
  onCreateProvider?: () => void;
  onGenerateReport?: () => void;
  onRestockProduct?: (productId: string) => void;
}

export function DashboardOverview({
  salesData,
  monthlySalesData,
  products,
  orders,
  customers,
  activities = [],
  onCreateProduct,
  onCreateOrder,
  onCreateCustomer,
  onCreateWorkshop,
  onCreateProvider,
  onGenerateReport,
  onRestockProduct,
}: DashboardOverviewProps) {
  const [activeView, setActiveView] = useState<'overview' | 'metrics' | 'alerts' | 'activity'>('overview');

  // Calcular estadísticas rápidas
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pendiente').length;
  const lowStockCount = products.filter(p => p.stock <= 10).length;
  const recentActivities = activities.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header con resumen rápido */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1">Panel de Control</h2>
          <p className="text-gray-600">
            Resumen general de SurtiCamisetas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Hoy
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Resumen de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-l-4 border-l-black">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ingresos del Mes</p>
              <h3 className="text-2xl mb-1">${Math.round(totalRevenue / 1000)}K</h3>
              <p className="text-xs text-green-600">+12.5% vs mes anterior</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-yellow-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pedidos Pendientes</p>
              <h3 className="text-2xl mb-1">{pendingOrders}</h3>
              <p className="text-xs text-yellow-600">Requieren procesamiento</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Activity className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-red-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Alertas de Stock</p>
              <h3 className="text-2xl mb-1">{lowStockCount}</h3>
              <p className="text-xs text-red-600">Productos bajo mínimo</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Productos</p>
              <h3 className="text-2xl mb-1">{products.length}</h3>
              <p className="text-xs text-blue-600">En catálogo</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <QuickActions
        onCreateProduct={onCreateProduct}
        onCreateOrder={onCreateOrder}
        onCreateCustomer={onCreateCustomer}
        onCreateWorkshop={onCreateWorkshop}
        onCreateProvider={onCreateProvider}
        onGenerateReport={onGenerateReport}
      />

      {/* Tabs para diferentes vistas */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Métricas</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Alertas</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Actividad</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas Principales */}
            <div className="space-y-6">
              <AdvancedMetrics
                salesData={salesData}
                monthlySalesData={monthlySalesData}
                products={products}
                orders={orders}
                customers={customers}
              />
            </div>

            {/* Timeline de Actividad */}
            <div>
              <ActivityTimeline activities={recentActivities} maxHeight="800px" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <AdvancedMetrics
            salesData={salesData}
            monthlySalesData={monthlySalesData}
            products={products}
            orders={orders}
            customers={customers}
          />
        </TabsContent>

        <TabsContent value="alerts">
          <InventoryAlerts products={products} onRestockProduct={onRestockProduct} />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTimeline activities={activities} maxHeight="700px" showFilters />
        </TabsContent>
      </Tabs>
    </div>
  );
}



