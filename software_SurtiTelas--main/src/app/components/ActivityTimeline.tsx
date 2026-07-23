import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  Package,
  ShoppingCart,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Edit,
  Trash2,
  Plus,
  AlertCircle,
} from 'lucide-react';

export interface TimelineActivity {
  id: string;
  type: 'create' | 'update' | 'delete' | 'complete' | 'cancel' | 'warning' | 'info';
  category: 'product' | 'order' | 'customer' | 'workshop' | 'provider' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  metadata?: {
    itemName?: string;
    status?: string;
    amount?: number;
    [key: string]: any;
  };
}

interface ActivityTimelineProps {
  activities: TimelineActivity[];
  maxHeight?: string;
  showFilters?: boolean;
}

export function ActivityTimeline({
  activities,
  maxHeight = '600px',
  showFilters = false,
}: ActivityTimelineProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <Plus className="h-4 w-4" />;
      case 'update':
        return <Edit className="h-4 w-4" />;
      case 'delete':
        return <Trash2 className="h-4 w-4" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancel':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'product':
        return <Package className="h-4 w-4" />;
      case 'order':
        return <ShoppingCart className="h-4 w-4" />;
      case 'customer':
        return <Users className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'create':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'update':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delete':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'complete':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancel':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      product: 'Productos',
      order: 'Pedidos',
      customer: 'Clientes',
      workshop: 'Talleres',
      provider: 'Proveedores',
      system: 'Sistema',
    };
    return labels[category] || category;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      create: 'Creado',
      update: 'Actualizado',
      delete: 'Eliminado',
      complete: 'Completado',
      cancel: 'Cancelado',
      warning: 'Advertencia',
      info: 'Información',
    };
    return labels[type] || type;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Actividad Reciente
        </h3>
        <Badge variant="outline">{activities.length} actividades</Badge>
      </div>

      <ScrollArea style={{ height: maxHeight }}>
        <div className="relative space-y-4">
          {/* Línea vertical del timeline */}
          <div className="absolute left-[17px] top-3 bottom-3 w-0.5 bg-gray-200" />

          {activities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No hay actividad reciente</p>
            </div>
          ) : (
            activities.map((activity, index) => (
              <div key={activity.id} className="relative pl-12">
                {/* Icono del tipo de actividad */}
                <div
                  className={`absolute left-0 top-1 p-2 rounded-full border-2 border-white ${getActivityColor(
                    activity.type
                  )}`}
                >
                  {getActivityIcon(activity.type)}
                </div>

                {/* Contenido de la actividad */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getActivityColor(activity.type)}>
                          {getTypeLabel(activity.type)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryIcon(activity.category)}
                          <span className="ml-1">{getCategoryLabel(activity.category)}</span>
                        </Badge>
                      </div>
                      <h4 className="font-medium">{activity.title}</h4>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>

                  {activity.metadata && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                      {activity.metadata.itemName && (
                        <div className="text-xs">
                          <span className="text-gray-500">Item:</span>{' '}
                          <span className="font-medium">{activity.metadata.itemName}</span>
                        </div>
                      )}
                      {activity.metadata.status && (
                        <div className="text-xs">
                          <span className="text-gray-500">Estado:</span>{' '}
                          <span className="font-medium">{activity.metadata.status}</span>
                        </div>
                      )}
                      {activity.metadata.amount !== undefined && (
                        <div className="text-xs">
                          <span className="text-gray-500">Monto:</span>{' '}
                          <span className="font-medium">
                            ${activity.metadata.amount.toLocaleString('es-CO')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {activity.user && (
                    <p className="text-xs text-gray-500 mt-2">
                      <Users className="h-3 w-3 inline mr-1" />
                      {activity.user}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

// Hook para generar actividades de ejemplo
export function useActivityTimeline() {
  const generateActivity = (
    type: TimelineActivity['type'],
    category: TimelineActivity['category'],
    title: string,
    description: string,
    metadata?: TimelineActivity['metadata']
  ): TimelineActivity => {
    return {
      id: `activity-${Date.now()}-${Math.random()}`,
      type,
      category,
      title,
      description,
      timestamp: new Date(),
      user: 'Administrador',
      metadata,
    };
  };

  const createProductActivity = (productName: string): TimelineActivity => {
    return generateActivity(
      'create',
      'product',
      'Producto creado',
      `Se agregó "${productName}" al catálogo`,
      { itemName: productName }
    );
  };

  const updateOrderActivity = (orderId: string, status: string): TimelineActivity => {
    return generateActivity(
      'update',
      'order',
      'Pedido actualizado',
      `El estado del pedido ${orderId} cambió a ${status}`,
      { itemName: orderId, status }
    );
  };

  const completeOrderActivity = (orderId: string, amount: number): TimelineActivity => {
    return generateActivity(
      'complete',
      'order',
      'Pedido completado',
      `El pedido ${orderId} se completó exitosamente`,
      { itemName: orderId, amount }
    );
  };

  const createCustomerActivity = (customerName: string): TimelineActivity => {
    return generateActivity(
      'create',
      'customer',
      'Cliente registrado',
      `Nuevo cliente "${customerName}" agregado al sistema`,
      { itemName: customerName }
    );
  };

  const lowStockWarning = (productName: string, stock: number): TimelineActivity => {
    return generateActivity(
      'warning',
      'product',
      'Advertencia de stock bajo',
      `El producto "${productName}" tiene solo ${stock} unidades disponibles`,
      { itemName: productName }
    );
  };

  return {
    generateActivity,
    createProductActivity,
    updateOrderActivity,
    completeOrderActivity,
    createCustomerActivity,
    lowStockWarning,
  };
}



