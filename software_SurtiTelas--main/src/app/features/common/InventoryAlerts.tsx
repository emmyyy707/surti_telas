import { useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  AlertTriangle,
  Package,
  TrendingDown,
  RefreshCw,
  Bell,
  X,
  ChevronRight,
  AlertCircle,
  PackageX,
  PackageCheck,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Progress } from './ui/progress';

interface Product {
  id: string;
  name: string;
  stock: number;
  minStock?: number;
  category: string;
  price: number;
}

interface InventoryAlertsProps {
  products: Product[];
  onRestockProduct?: (productId: string) => void;
}

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  priority: number;
  title: string;
  description: string;
  product: Product;
  action?: string;
}

export function InventoryAlerts({ products, onRestockProduct }: InventoryAlertsProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Generar alertas basadas en el inventario
  const generateAlerts = (): AlertItem[] => {
    const alerts: AlertItem[] = [];

    products.forEach(product => {
      const minStock = product.minStock || 10;
      const stockPercentage = (product.stock / minStock) * 100;

      // Producto agotado
      if (product.stock === 0) {
        alerts.push({
          id: `${product.id}-out`,
          type: 'critical',
          priority: 1,
          title: 'Producto Agotado',
          description: `${product.name} está completamente agotado`,
          product,
          action: 'restock',
        });
      }
      // Stock crítico (menos del 30% del mínimo)
      else if (product.stock <= minStock * 0.3) {
        alerts.push({
          id: `${product.id}-critical`,
          type: 'critical',
          priority: 2,
          title: 'Stock Crítico',
          description: `${product.name} tiene solo ${product.stock} unidades`,
          product,
          action: 'restock',
        });
      }
      // Stock bajo (entre 30% y 100% del mínimo)
      else if (product.stock <= minStock) {
        alerts.push({
          id: `${product.id}-low`,
          type: 'warning',
          priority: 3,
          title: 'Stock Bajo',
          description: `${product.name} necesitará reabastecimiento pronto`,
          product,
          action: 'monitor',
        });
      }
    });

    // Ordenar por prioridad
    return alerts.sort((a, b) => a.priority - b.priority);
  };

  const alerts = generateAlerts().filter(alert => !dismissedAlerts.includes(alert.id));

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  const criticalAlerts = alerts.filter(a => a.type === 'critical');
  const warningAlerts = alerts.filter(a => a.type === 'warning');

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <PackageX className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  const getStockLevel = (stock: number, minStock: number = 10) => {
    const percentage = (stock / minStock) * 100;
    if (stock === 0) return { label: 'Agotado', color: 'bg-red-500' };
    if (percentage <= 30) return { label: 'Crítico', color: 'bg-red-500' };
    if (percentage <= 100) return { label: 'Bajo', color: 'bg-yellow-500' };
    return { label: 'Normal', color: 'bg-green-500' };
  };

  return (
    <div className="space-y-6">
      {/* Resumen de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Alertas Críticas</p>
              <h3 className="text-3xl">{criticalAlerts.length}</h3>
              <p className="text-xs text-red-600 mt-1">Requieren atención inmediata</p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Advertencias</p>
              <h3 className="text-3xl">{warningAlerts.length}</h3>
              <p className="text-xs text-yellow-600 mt-1">Revisar próximamente</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Alertas</p>
              <h3 className="text-3xl">{alerts.length}</h3>
              <p className="text-xs text-gray-600 mt-1">Activas en el sistema</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Alertas */}
      {alerts.length === 0 ? (
        <Card className="p-12 text-center">
          <PackageCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl mb-2">Todo en Orden</h3>
          <p className="text-gray-600">
            No hay alertas de inventario en este momento. Todos los productos tienen stock adecuado.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const stockLevel = getStockLevel(alert.product.stock, alert.product.minStock);
            const stockPercentage = Math.min(
              (alert.product.stock / (alert.product.minStock || 10)) * 100,
              100
            );

            return (
              <Alert
                key={alert.id}
                className={`${getAlertColor(alert.type)} border-l-4 relative`}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => dismissAlert(alert.id)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="flex items-start gap-4 pr-8">
                  <div
                    className={`p-2 rounded-lg ${
                      alert.type === 'critical'
                        ? 'bg-red-200'
                        : alert.type === 'warning'
                        ? 'bg-yellow-200'
                        : 'bg-blue-200'
                    }`}
                  >
                    {getAlertIcon(alert.type)}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <AlertTitle className="mb-1">{alert.title}</AlertTitle>
                          <AlertDescription>{alert.description}</AlertDescription>
                        </div>
                        <Badge
                          className={`${stockLevel.color} text-white`}
                        >
                          {stockLevel.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Stock actual</span>
                        <span className="font-medium">
                          {alert.product.stock} / {alert.product.minStock || 10} unidades
                        </span>
                      </div>
                      <Progress value={stockPercentage} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {alert.product.category}
                        </span>
                        <span>${alert.product.price.toLocaleString('es-CO')}</span>
                      </div>

                      {onRestockProduct && alert.action === 'restock' && (
                        <Button
                          size="sm"
                          onClick={() => onRestockProduct(alert.product.id)}
                          className="bg-black hover:bg-gray-800"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reabastecer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Alert>
            );
          })}
        </div>
      )}

      {/* Recomendaciones */}
      {alerts.length > 0 && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="mb-3 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-blue-600" />
            Recomendaciones de Reabastecimiento
          </h3>
          <ul className="space-y-2">
            {criticalAlerts.slice(0, 3).map((alert, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <ChevronRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  Priorizar reabastecimiento de <strong>{alert.product.name}</strong> para
                  evitar pérdida de ventas
                </span>
              </li>
            ))}
            {criticalAlerts.length === 0 && warningAlerts.length > 0 && (
              <li className="flex items-start gap-2 text-sm">
                <ChevronRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>
                  Planificar pedidos para productos con stock bajo en los próximos 7 días
                </span>
              </li>
            )}
          </ul>
        </Card>
      )}
    </div>
  );
}




