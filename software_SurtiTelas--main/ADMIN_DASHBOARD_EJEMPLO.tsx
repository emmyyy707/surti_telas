/**
 * EJEMPLO DE INTEGRACIÓN EN AdminDashboard
 * Copia este código en tu AdminDashboard.tsx para usar los módulos ERP
 */

import React, { useState } from 'react';
import {
  Settings, Users, ShoppingCart, Package, Truck, Factory, CreditCard,
  RotateCcw, Shirt, Menu, X, ChevronRight
} from 'lucide-react';

import {
  ConfiguracionView,
  UsuariosView,
  ComprasView,
  InsumosView,
  VentasView,
  AbonasView,
  DevolucionesView,
  ProduccionView,
  PedidosDomiciliosView,
  moduleConfig,
} from './components/admin/ERPViews';

// ============================================================================
// SIDEBAR NAVIGATION
// ============================================================================

interface ModuleItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const moduleItems: ModuleItem[] = [
  {
    id: 'configuracion',
    label: 'Configuración',
    icon: <Settings size={20} />,
    color: '#3B82F6',
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: <Users size={20} />,
    color: '#10B981',
  },
  {
    id: 'compras',
    label: 'Compras',
    icon: <ShoppingCart size={20} />,
    color: '#8B5CF6',
  },
  {
    id: 'insumos',
    label: 'Insumos',
    icon: <Package size={20} />,
    color: '#F59E0B',
  },
  {
    id: 'ventas',
    label: 'Ventas',
    icon: <Truck size={20} />,
    color: '#EC4899',
  },
  {
    id: 'abonos',
    label: 'Abonos',
    icon: <CreditCard size={20} />,
    color: '#06B6D4',
  },
  {
    id: 'devoluciones',
    label: 'Devoluciones',
    icon: <RotateCcw size={20} />,
    color: '#EF4444',
  },
  {
    id: 'produccion',
    label: 'Producción',
    icon: <Factory size={20} />,
    color: '#14B8A6',
  },
  {
    id: 'pedidosDomicilios',
    label: 'Pedidos & Domicilios',
    icon: <Shirt size={20} />,
    color: '#F97316',
  },
];

// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

interface SidebarProps {
  activeModule: string;
  onModuleChange: (moduleId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ERPSidebar: React.FC<SidebarProps> = ({
  activeModule,
  onModuleChange,
  isOpen,
  onToggle,
}) => {
  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className="md:hidden fixed bottom-6 right-6 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-30
          w-64 bg-white shadow-lg
          transform md:transform-none transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          overflow-y-auto
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">SurtiCamisetas</h2>
          <p className="text-xs text-gray-500 mt-1">Sistema ERP</p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {moduleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onModuleChange(item.id);
                onToggle();
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-all duration-200 group
                ${
                  activeModule === item.id
                    ? 'bg-blue-50 border-l-4 border-blue-600'
                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                }
              `}
            >
              <div
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  activeModule === item.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                }`}
              >
                {item.icon}
              </div>
              <span
                className={`flex-1 text-left font-medium ${
                  activeModule === item.id ? 'text-gray-900' : 'text-gray-600'
                }`}
              >
                {item.label}
              </span>
              {activeModule === item.id && (
                <ChevronRight size={18} className="text-blue-600" />
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            v1.0.0 - Production Ready
          </p>
        </div>
      </aside>
    </>
  );
};

// ============================================================================
// HEADER COMPONENT
// ============================================================================

interface HeaderProps {
  activeModule: string;
  onLogout: () => void;
}

const ERPHeader: React.FC<HeaderProps> = ({ activeModule, onLogout }) => {
  const module = moduleConfig[activeModule as keyof typeof moduleConfig];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: module?.color || '#3B82F6' }}
          >
            {module?.name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {module?.name || 'Módulo'}
            </h1>
            <p className="text-xs text-gray-500">
              {new Date().toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
            ðŸ””
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

// ============================================================================
// MAIN ADMIN DASHBOARD COMPONENT
// ============================================================================

export const AdminDashboardERP: React.FC = () => {
  const [activeModule, setActiveModule] = useState('configuracion');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Render active module
  const renderModule = () => {
    switch (activeModule) {
      case 'configuracion':
        return <ConfiguracionView />;
      case 'usuarios':
        return <UsuariosView />;
      case 'compras':
        return <ComprasView />;
      case 'insumos':
        return <InsumosView />;
      case 'ventas':
        return <VentasView />;
      case 'abonos':
        return <AbonasView />;
      case 'devoluciones':
        return <DevolucionesView />;
      case 'produccion':
        return <ProduccionView />;
      case 'pedidosDomicilios':
        return <PedidosDomiciliosView />;
      default:
        return <ConfiguracionView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ERPSidebar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 md:ml-0 overflow-hidden flex flex-col">
        {/* Header */}
        <ERPHeader
          activeModule={activeModule}
          onLogout={() => {
            console.log('Logout');
            // Redirigir a login
          }}
        />

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {renderModule()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardERP;


