import { useState } from 'react';
import { Bell, Package, TrendingDown, AlertTriangle, CheckCircle2, Clock, X, Settings } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Card } from '../../components/ui/card';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: any;
  action?: {
    label: string;
    moduleId: string;
  };
}

interface NotificationsDropdownProps {
  onNavigate?: (moduleId: string) => void;
}

export function NotificationsDropdown({ onNavigate }: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Stock Bajo',
      message: 'Tela Jersey Blanca - Solo quedan 15 metros',
      time: 'Hace 5 min',
      read: false,
      icon: TrendingDown,
      action: { label: 'Ver Inventario', moduleId: 'gestion-insumos' }
    },
    {
      id: '2',
      type: 'info',
      title: 'Nuevo Pedido',
      message: 'Pedido PED-108 recibido de Mará González',
      time: 'Hace 12 min',
      read: false,
      icon: Package,
      action: { label: 'Ver Pedido', moduleId: 'gestion-pedidos' }
    },
    {
      id: '3',
      type: 'error',
      title: 'Pago Rechazado',
      message: 'Comprobante de pago del pedido ORD-005 rechazado',
      time: 'Hace 20 min',
      read: false,
      icon: AlertTriangle,
      action: { label: 'Revisar', moduleId: 'historial-pagos' }
    },
    {
      id: '4',
      type: 'success',
      title: 'Producción Completada',
      message: 'Taller "El Roble" finalizó el pedido PED-001',
      time: 'Hace 1 hora',
      read: false,
      icon: CheckCircle2,
      action: { label: 'Ver Producción', moduleId: 'seguimiento-produccion' }
    },
    {
      id: '5',
      type: 'warning',
      title: 'Retraso en Entrega',
      message: 'Domicilio del pedido ORD-003 estó retrasado',
      time: 'Hace 2 horas',
      read: true,
      icon: Clock,
    },
    {
      id: '6',
      type: 'info',
      title: 'Cliente Nuevo',
      message: 'Nuevo cliente registrado: Empresa XYZ S.A.S',
      time: 'Hace 3 horas',
      read: true,
      icon: CheckCircle2,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getTypeStyles = (type: string) => {
    const styles = {
      info: 'bg-blue-500/10 text-blue-600',
      warning: 'bg-yellow-500/10 text-yellow-600',
      success: 'bg-green-500/10 text-green-600',
      error: 'bg-red-500/10 text-red-600'
    };
    return styles[type as keyof typeof styles];
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
{/* Dropdown */}
           <Card className="absolute right-0 top-12 w-screen max-w-sm sm:max-w-md z-50 shadow-2xl border mx-2 sm:mx-0">
             <div className="p-3 sm:p-4 border-b flex items-center justify-between">
               <div>
                 <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Notificaciones</h3>
                 <p className="text-xs text-gray-500">{unreadCount} sin leer</p>
               </div>
               <div className="flex gap-1 sm:gap-2">
                 {unreadCount > 0 && (
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={markAllAsRead}
                     className="text-xs h-7 px-2"
                   >
                     Marcar todas
                   </Button>
                 )}
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => setIsOpen(false)}
                   className="h-7 w-7 p-0"
                 >
                   <X className="h-3.5 w-3.5" />
                 </Button>
               </div>
             </div>

             <ScrollArea className="h-80 max-h-[60vh]">
               {notifications.length === 0 ? (
                 <div className="p-6 sm:p-8 text-center text-gray-500">
                   <Bell className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-20" />
                   <p className="text-sm">No hay notificaciones</p>
                 </div>
               ) : (
                 <div className="divide-y">
                   {notifications.map((notification) => {
                     const Icon = notification.icon;
                     return (
                       <div
                         key={notification.id}
                         className={`p-3 sm:p-4 hover:bg-gray-50 transition-colors ${
                           !notification.read ? 'bg-blue-50/50' : ''
                         }`}
                       >
                         <div className="flex gap-2 sm:gap-3">
                           <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center flex-shrink-0 ${getTypeStyles(notification.type)}`}>
                             <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="flex items-start justify-between gap-1 sm:gap-2">
                               <div className="flex-1">
                                 <p className="font-medium text-gray-900 text-xs sm:text-sm">
                                   {notification.title}
                                 </p>
                                 <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                   {notification.message}
                                 </p>
                                 <p className="text-xs text-gray-500 mt-1">
                                   {notification.time}
                                 </p>
                               </div>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => deleteNotification(notification.id)}
                                 className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
                               >
                                 <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                               </Button>
                             </div>
                             {notification.action && (
                               <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={() => {
                                   if (onNavigate) {
                                     onNavigate(notification.action!.moduleId);
                                   }
                                   markAsRead(notification.id);
                                   setIsOpen(false);
                                 }}
                                 className="mt-2 h-6 text-xs"
                               >
                                 {notification.action.label}
                               </Button>
                             )}
                           </div>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               )}
             </ScrollArea>

             <div className="p-2 sm:p-3 border-t bg-gray-50">
               <Button
                 variant="ghost"
                 size="sm"
                 className="w-full justify-center text-xs h-7"
               >
                 <Settings className="h-3 w-3 mr-1.5" />
                 Configurar Notificaciones
               </Button>
             </div>
           </Card>
        </>
      )}
    </div>
  );
}




