import { Plus, Package, Users, ShoppingCart, FileText, TrendingUp, Factory, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

interface QuickActionsProps {
  actions?: QuickAction[];
  onCreateProduct?: () => void;
  onCreateOrder?: () => void;
  onCreateCustomer?: () => void;
  onCreateWorkshop?: () => void;
  onCreateProvider?: () => void;
  onGenerateReport?: () => void;
}

export function QuickActions({
  actions,
  onCreateProduct,
  onCreateOrder,
  onCreateCustomer,
  onCreateWorkshop,
  onCreateProvider,
  onGenerateReport,
}: QuickActionsProps) {
  const defaultActions: QuickAction[] = [
    {
      id: 'create-product',
      label: 'Nuevo Producto',
      icon: <Package className="h-4 w-4" />,
      description: 'Agregar producto al catálogo',
      onClick: onCreateProduct || (() => {}),
      variant: 'primary',
    },
    {
      id: 'create-order',
      label: 'Nuevo Pedido',
      icon: <ShoppingCart className="h-4 w-4" />,
      description: 'Crear pedido manualmente',
      onClick: onCreateOrder || (() => {}),
      variant: 'primary',
    },
    {
      id: 'create-customer',
      label: 'Nuevo Cliente',
      icon: <Users className="h-4 w-4" />,
      description: 'Registrar nuevo cliente',
      onClick: onCreateCustomer || (() => {}),
    },
    {
      id: 'create-workshop',
      label: 'Nuevo Taller',
      icon: <Factory className="h-4 w-4" />,
      description: 'Configurar taller de producción',
      onClick: onCreateWorkshop || (() => {}),
    },
    {
      id: 'create-provider',
      label: 'Nuevo Proveedor',
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Agregar proveedor',
      onClick: onCreateProvider || (() => {}),
    },
    {
      id: 'generate-report',
      label: 'Generar Reporte',
      icon: <FileText className="h-4 w-4" />,
      description: 'Crear reporte personalizado',
      onClick: onGenerateReport || (() => {}),
      variant: 'success',
    },
  ];

  const quickActions = actions || defaultActions;

  const getButtonVariant = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'default';
      case 'success':
        return 'outline';
      case 'warning':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getButtonClassName = (variant?: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-black hover:bg-gray-800 text-white';
      case 'success':
        return 'border-green-500 text-green-700 hover:bg-green-50';
      case 'warning':
        return 'border-yellow-500 text-yellow-700 hover:bg-yellow-50';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Versión Desktop - Tarjetas */}
      <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <Card
            key={action.id}
            className="p-4 hover:shadow-lg transition-all cursor-pointer group"
            onClick={action.onClick}
          >
            <div className="flex items-start gap-3">
              <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-black group-hover:text-white transition-colors">
                {action.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium mb-1">{action.label}</h4>
                {action.description && (
                  <p className="text-sm text-gray-600">{action.description}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Versión Mobile/Tablet - Dropdown */}
      <div className="lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full bg-black hover:bg-gray-800 text-white" size="lg">
              <Zap className="h-4 w-4 mr-2" />
              Acciones Rápidas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72" align="start">
            <DropdownMenuLabel>Acciones Rápidas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {quickActions.map((action) => (
              <DropdownMenuItem
                key={action.id}
                onClick={action.onClick}
                className="cursor-pointer"
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{action.label}</p>
                    {action.description && (
                      <p className="text-xs text-gray-600 mt-0.5">{action.description}</p>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Versión Compacta - Botones Horizontales */}
      <div className="hidden md:flex lg:hidden gap-2 flex-wrap">
        {quickActions.slice(0, 4).map((action) => (
          <Button
            key={action.id}
            onClick={action.onClick}
            variant={getButtonVariant(action.variant)}
            className={getButtonClassName(action.variant)}
          >
            {action.icon}
            <span className="ml-2">{action.label}</span>
          </Button>
        ))}
        {quickActions.length > 4 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Más
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {quickActions.slice(4).map((action) => (
                <DropdownMenuItem
                  key={action.id}
                  onClick={action.onClick}
                  className="cursor-pointer"
                >
                  {action.icon}
                  <span className="ml-2">{action.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

// Botón flotante de acción rápida (FAB)
interface FloatingActionButtonProps {
  onClick?: () => void;
  icon?: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function FloatingActionButton({
  onClick,
  icon = <Plus className="h-6 w-6" />,
  label = 'Acción Rápida',
  position = 'bottom-right',
}: FloatingActionButtonProps) {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  return (
    <Button
      onClick={onClick}
      size="lg"
      className={`fixed ${positionClasses[position]} h-14 w-14 rounded-full shadow-lg bg-black hover:bg-gray-800 text-white z-50 md:hidden group`}
      title={label}
    >
      {icon}
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {label}
      </span>
    </Button>
  );
}



