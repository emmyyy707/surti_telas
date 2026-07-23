import { useState, useEffect } from 'react';
import { Bell, X, Package, AlertTriangle, TrendingUp, Users, CheckCircle, Clock, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Separator } from './ui/separator';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  icon?: 'package' | 'alert' | 'trending' | 'users' | 'check' | 'clock' | 'cart';
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (iconType?: string) => {
    switch (iconType) {
      case 'package':
        return <Package className="h-4 w-4" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4" />;
      case 'users':
        return <Users className="h-4 w-4" />;
      case 'check':
        return <CheckCircle className="h-4 w-4" />;
      case 'clock':
        return <Clock className="h-4 w-4" />;
      case 'cart':
        return <ShoppingCart className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-CO');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Notificaciones</SheetTitle>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkAllAsRead}
                    className="text-xs"
                  >
                    Marcar todas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Limpiar todo
                </Button>
              </div>
            )}
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <Bell className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500">No hay notificaciones</p>
            <p className="text-sm text-gray-400 mt-2">
              Te notificaremos cuando haya novedades
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    !notification.read ? 'border-l-4 border-l-black bg-gray-50' : ''
                  } ${getTypeColor(notification.type)}`}
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      notification.type === 'success' ? 'bg-green-200' :
                      notification.type === 'warning' ? 'bg-yellow-200' :
                      notification.type === 'error' ? 'bg-red-200' :
                      'bg-blue-200'
                    }`}>
                      {getIcon(notification.icon)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-black flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500">{formatTime(notification.timestamp)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Hook personalizado para generar notificaciones automáticas
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const generateLowStockNotifications = (products: any[]) => {
    products.forEach(product => {
      if (product.stock <= 10 && product.stock > 0) {
        addNotification({
          type: 'warning',
          title: 'Stock Bajo',
          message: `El producto "${product.name}" tiene solo ${product.stock} unidades disponibles`,
          icon: 'alert',
        });
      } else if (product.stock === 0) {
        addNotification({
          type: 'error',
          title: 'Sin Stock',
          message: `El producto "${product.name}" está agotado`,
          icon: 'package',
        });
      }
    });
  };

  const generateOrderNotifications = (orders: any[]) => {
    const pendingOrders = orders.filter(o => o.status === 'pendiente');
    if (pendingOrders.length > 0) {
      addNotification({
        type: 'info',
        title: 'Pedidos Pendientes',
        message: `Tienes ${pendingOrders.length} pedidos pendientes por procesar`,
        icon: 'cart',
      });
    }
  };

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    generateLowStockNotifications,
    generateOrderNotifications,
  };
}




