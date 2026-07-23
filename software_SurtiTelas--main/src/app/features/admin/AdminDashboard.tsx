import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Settings,
  Shield,
  Lock,
  Users,
  Package,
  Boxes,
  Truck,
  AlertTriangle,
  Factory,
  ClipboardList,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  Mail,
  RotateCcw,
  BarChart3,
  LogOut,
  Menu,
  X,
  Plus,
  Search,
  Download,
  FileText,
  Filter,
  Eye,
  Edit,
  Trash2,
  Check,
  XCircle,
  UserCheck,
  FileCheck,
  DollarSign,
  Calendar,
  TrendingDown,
  Package2,
  ShoppingBag,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Moon,
  Sun,
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import logoBlanco from 'figma:asset/a65aac63d3b0db11ac2d926ba04f2e4b6c29cde1.png';

// Importar componentes de módulos
import { DashboardGeneral } from '../features/admin/DashboardGeneral';
import { ConfiguracionModule } from '../features/admin/ConfiguracionModule';
import { UsuariosModule } from '../features/admin/UsuariosModule';
import { InventarioModule } from '../features/admin/InventarioModule';
import { ProduccionModule } from '../features/admin/ProduccionModule';
import { VentasModule } from '../features/admin/VentasModule';
import { DevolucionesModule } from '../features/admin/DevolucionesModule';
import { ReportesModule } from '../features/admin/ReportesModule';
import { HistorialPagosModule } from '../features/admin/HistorialPagosModule';
import { InsumosModule } from '../features/admin/InsumosModule';
import { ClientesModule } from '../features/admin/ClientesModule';
import { DomiciliosModule } from '../features/admin/DomiciliosModule';
import { NotificationsDropdown } from '../features/admin/NotificationsDropdown';
import { MisClientesModule } from '../features/asesor/MisClientesModule';
import { ComisionesModule } from '../features/asesor/ComisionesModule';
import { EntregasModule } from '../features/domiciliario/EntregasModule';
import { RutasModule } from '../features/domiciliario/RutasModule';
import { ResumenCliente } from '../features/cliente/ResumenCliente';
import { MisPedidosCliente } from '../features/cliente/MisPedidosCliente';
import { DireccionesCliente } from '../features/cliente/DireccionesCliente';
import { MetodosPagoCliente } from '../features/cliente/MetodosPagoCliente';
import { MiPerfilCliente } from '../features/cliente/MiPerfilCliente';
import { CatalogoCliente } from '../features/cliente/CatalogoCliente';
import { getMenuByRole, getDashboardTitle, getUserEmailByRole } from '../config/menuConfig';
import { useTheme } from '../contexts/ThemeContext';

interface AdminDashboardProps {
  onLogout: () => void;
  orders?: any[];
  onUpdateOrderStatus?: (orderId: string, status: string) => void;
  userRole?: 'admin' | 'asesor' | 'domiciliario' | 'cliente';
  userName?: string;
  onUpdateUserName?: (newName: string) => void;
  onNavigateToLanding?: () => void;
}

export function AdminDashboard({
  onLogout,
  orders = [],
  onUpdateOrderStatus,
  userRole = 'admin',
  userName = 'Usuario',
  onUpdateUserName,
  onNavigateToLanding,
}: AdminDashboardProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState(
    userRole === 'domiciliario' ? 'entregas' : userRole === 'cliente' ? 'resumen-cliente' : 'dashboard'
  );
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});

  const { theme, toggleTheme } = useTheme();

  // Obtener configuración de menú según el rol
  const menuItems = getMenuByRole(userRole);
  const dashboardTitle = getDashboardTitle(userRole);
  const userEmail = getUserEmailByRole(userRole);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(false);
        setMobileMenuOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleModuleChange = (moduleId: string) => {
    // Si es el catálogo del cliente, navegar a la landing page
    if (moduleId === 'catalogo-cliente' && onNavigateToLanding) {
      onNavigateToLanding();
      return;
    }
    setActiveModule(moduleId);
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardGeneral onNavigate={handleModuleChange} />;

      // Módulos de Administrador
      case 'configuracion':
      case 'roles':
      case 'permisos':
        return <ConfiguracionModule activeTab={activeModule} />;
      case 'usuarios':
      case 'gestion-usuarios':
      case 'gestion-acceso':
      case 'seguridad-usuarios':
        return <UsuariosModule activeTab={activeModule} />;
      case 'inventario':
      case 'gestion-insumos':
      case 'productos-terminados':
      case 'proveedores':
      case 'alertas-stock':
        return <InventarioModule activeTab={activeModule} />;
      case 'produccion':
      case 'registro-talleres':
      case 'asignacion-produccion':
      case 'seguimiento-produccion':
      case 'control-prendas':
        return <ProduccionModule activeTab={activeModule} />;
      case 'ventas':
      case 'gestion-clientes':
      case 'catalogo-digital':
      case 'gestion-pedidos':
      case 'facturacion':
      case 'pagos-abonos':
      case 'contacto-empresa':
      case 'control-stock-devuelto':
        return <VentasModule activeTab={activeModule} />;
      case 'historial-pagos':
        return <HistorialPagosModule orders={orders} />;
      case 'reportes':
      case 'reportes-inventario':
      case 'reportes-produccion':
      case 'reportes-ventas':
      case 'reportes-usuarios':
        return <ReportesModule activeTab={activeModule} />;

      // Módulos de Asesor
      case 'clientes':
      case 'lista-clientes':
      case 'nuevo-cliente':
      case 'seguimiento':
        return <MisClientesModule />;
      case 'pedidos':
      case 'crear-pedido':
      case 'pedidos-activos':
      case 'historial-pedidos':
        return <VentasModule activeTab="gestion-pedidos" />;
      case 'comisiones':
      case 'comisiones-mes':
      case 'historico-comisiones':
        return <ComisionesModule />;
      case 'calificaciones':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Calificaciones</h1>
            <p className="text-gray-600 mt-2">Módulo de calificaciones en desarrollo</p>
          </div>
        );
      case 'mensajes':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Mensajes</h1>
            <p className="text-gray-600 mt-2">Módulo de mensajes en desarrollo</p>
          </div>
        );

      // Módulos de Domiciliario
      case 'entregas':
      case 'entregas-pendientes':
      case 'entregas-en-proceso':
      case 'entregas-completadas':
        return <EntregasModule />;
      case 'rutas':
      case 'ruta-hoy':
      case 'proximas-rutas':
      case 'historial-rutas':
        return <RutasModule />;
      case 'escaner':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Escanear QR</h1>
            <p className="text-gray-600 mt-2">Módulo de escaneo QR en desarrollo</p>
          </div>
        );
      case 'historial':
      case 'entregas-historico':
      case 'estadisticas':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Mi Historial</h1>
            <p className="text-gray-600 mt-2">Módulo de historial en desarrollo</p>
          </div>
        );

      // Módulos de Cliente
      case 'resumen-cliente':
        return <ResumenCliente userName={userName} onNavigate={handleModuleChange} />;
      case 'catalogo-cliente':
        return <CatalogoCliente />;
      case 'mis-pedidos-cliente':
        return <MisPedidosCliente />;
      case 'direcciones-cliente':
        return <DireccionesCliente />;
      case 'metodos-pago-cliente':
        return <MetodosPagoCliente />;
      case 'perfil-cliente':
        return <MiPerfilCliente userName={userName} onUpdateUserName={onUpdateUserName || (() => {})} />;

      default:
        if (userRole === 'domiciliario') {
          return <EntregasModule />;
        }
        if (userRole === 'cliente') {
          return <ResumenCliente userName={userName} onNavigate={handleModuleChange} />;
        }
        return <DashboardGeneral onNavigate={handleModuleChange} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-canvas)] dark:bg-[var(--bg-canvas)]">
      {/* Overlay para móvil */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

{/* Sidebar */}
        <div
          className={`bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] transition-all duration-300 ease-in-out flex flex-col fixed lg:relative inset-y-0 left-0 z-50 w-72 ${sidebarCollapsed ? 'w-20' : ''} ${isMobile && !mobileMenuOpen ? '-translate-x-full' : ''} ${isMobile && mobileMenuOpen ? 'translate-x-0' : ''}`}
        >
        {/* Header con logo y toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 relative">
          {(!sidebarCollapsed || isMobile) && (
            <div className="flex items-center gap-3 flex-1 pr-2">
              <img src={logoBlanco} alt="Surti Camisetas" className="h-6 w-auto object-contain" />
            </div>
          )}
          {sidebarCollapsed && !isMobile && (
            <div className="flex justify-center items-center w-full py-2">
              <img src={logoBlanco} alt="Surti Camisetas" className="h-6 w-auto object-contain max-w-[32px]" />
            </div>
          )}
          {!isMobile && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all z-10 flex-shrink-0 ${
                sidebarCollapsed ? 'absolute -right-3 top-1/2 -translate-y-1/2 bg-[#0D0D0D] border border-gray-700 shadow-lg' : ''
              }`}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          )}
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (isMobile) {
                      // En móvil, comportamiento simplificado
                      if (item.subItems) {
                        toggleMenu(item.id);
                      } else {
                        handleModuleChange(item.id);
                        setMobileMenuOpen(false);
                      }
                    } else if (sidebarCollapsed) {
                      // Si está colapsado y NO tiene subítems, navegar directamente
                      if (!item.subItems) {
                        handleModuleChange(item.id);
                      } else {
                        // Si tiene subítems, expandir el menú y abrir el submenú
                        setSidebarCollapsed(false);
                        setExpandedMenus(prev => ({
                          ...prev,
                          [item.id]: true
                        }));
                      }
                    } else {
                      // Si está expandido, comportamiento normal
                      if (item.subItems) {
                        toggleMenu(item.id);
                      } else {
                        handleModuleChange(item.id);
                      }
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeModule === item.id || activeModule.startsWith(item.id)
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  } ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}`}
                  title={sidebarCollapsed && !isMobile ? item.label : ''}
                >
                  <item.icon className={`h-5 w-5 ${sidebarCollapsed && !isMobile ? '' : 'flex-shrink-0'}`} />
                  {(!sidebarCollapsed || isMobile) && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.subItems && (
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${expandedMenus[item.id] ? 'rotate-180' : ''}`}
                        />
                      )}
                    </>
                  )}
                </button>
                {(!sidebarCollapsed || isMobile) && item.subItems && expandedMenus[item.id] && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => {
                          handleModuleChange(subItem.id);
                          if (isMobile) setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeModule === subItem.id
                            ? 'bg-white/10 text-white'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className="text-left">{subItem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Botón de Cerrar Sesión */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => {
              if (window.confirm('Â¿Estás seguro de que deseas cerrar sesión?')) {
                onLogout();
              }
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-gray-400 hover:bg-red-500/10 hover:text-red-500 ${
              sidebarCollapsed && !isMobile ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed && !isMobile ? 'Cerrar Sesión' : ''}
          >
            <LogOut className={`h-5 w-5 ${sidebarCollapsed && !isMobile ? '' : 'flex-shrink-0'}`} />
            {(!sidebarCollapsed || isMobile) && (
              <span className="flex-1 text-left">Cerrar Sesión</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
         {/* Top Bar */}
         <div className="bg-[var(--bg-elevated)] dark:bg-[var(--bg-elevated)] border-b border-[var(--border-default)] dark:border-[var(--border-default)] px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 -ml-2"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar..."
                className="pl-10 w-48 lg:w-64 bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationsDropdown onNavigate={handleModuleChange} />
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
              title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" className="sm:hidden p-2">
              <Download className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-900 dark:bg-gray-600 flex items-center justify-center text-white text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm hidden md:block">
                <p className="font-medium dark:text-white">{userName}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">{userEmail}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto transition-all duration-300 ease-in-out">
          {renderModule()}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;





