import { Menu, X, ChevronLeft, ChevronRight, LayoutDashboard, Users, Package, BarChart3, Settings, ShoppingCart, Factory, Truck, CreditCard, RotateCcw } from 'lucide-react';
import { Button } from '../../shared/ui/Button';
import { cn } from '../../shared/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'inventario', label: 'Inventario', icon: Package },
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
{ id: 'produccion', label: 'Producción', icon: Factory },
  { id: 'domicilios', label: 'Domicilios', icon: Truck },
  { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
];

export const Sidebar = ({ collapsed, onToggle, activeModule, onModuleChange }: SidebarProps) => {
  return (
    <aside
      className={cn(
        'bg-gray-900 text-gray-300 transition-all duration-300 ease-in-out flex flex-col',
        'fixed lg:relative inset-y-0 left-0 z-50 h-full',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && (
          <span className="text-xl font-bold text-white">SurtiCamisetas</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn('text-gray-400 hover:text-white', collapsed && 'mx-auto')}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onModuleChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              activeModule === item.id
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-white',
              collapsed && 'justify-center'
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};


