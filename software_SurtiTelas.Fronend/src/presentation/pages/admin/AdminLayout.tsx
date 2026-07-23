import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings2, Users, UserCog, Shield, Package, PackageOpen, Boxes, AlertTriangle, Archive, Factory, Workflow, ClipboardList, ShoppingCart, Receipt, UserSearch, BarChart3, TrendingUp, Users2, LineChart, Store, Truck, UserCheck, DollarSign, KeyRound, Webhook } from 'lucide-react';
import s from '../../../styles/admin/AdminLayout.module.css';
import { Sidebar, SidebarItem } from '@/shared/layouts/Sidebar';
import { useAuth } from '@/app/providers/AppProviders';
import { useDashboardTheme } from '@/core/hooks/useDashboardTheme';
import { TopHeader } from '@/presentation/components/TopHeader';
import { cn } from '@/shared/utils';
import logoImg from '@/assets/images/logos/partner-logo-2-Photoroom.png';
import { useAuthStore } from '@/core/stores/authStore';
import { useAppStore } from '@/core/stores';
import { tokenStorage } from '@/infrastructure/api/tokenStorage';
import { notificationsApi } from '@/infrastructure/api/notificationsApi';
import { reportsApi } from '@/infrastructure/api/reportsApi';
import { adminContent } from '@/shared/config/adminContent';

const adminMenu: SidebarItem[] = [
  { icon: LayoutDashboard, label: adminContent.layout.menu.dashboard.label, key: 'dashboard' },
  {
    icon: Settings2,
    label: adminContent.layout.menu.configuracion.label,
    key: 'configuracion',
    subItems: [
      { icon: Shield, label: adminContent.layout.menu.configuracion.roles.label, key: 'roles' },
      { icon: UserCog, label: adminContent.layout.menu.configuracion.permisos.label, key: 'permisos' },
    ],
  },
  {
    icon: Users,
    label: adminContent.layout.menu.usuarios.label,
    key: 'usuarios',
    subItems: [
      { icon: UserSearch, label: adminContent.layout.menu.usuarios.gestionUsuarios.label, key: 'gestion-usuarios' },
      { icon: Shield, label: adminContent.layout.menu.usuarios.seguridad.label, key: 'seguridad' },
      { icon: UserCheck, label: adminContent.layout.menu.usuarios.asesores.label, key: 'asesores' },
      { icon: KeyRound, label: adminContent.layout.menu.usuarios.gestionAcceso.label, key: 'gestion-acceso' },
    ],
  },
  {
    icon: Package,
    label: adminContent.layout.menu.inventario.label,
    key: 'inventario',
    subItems: [
      { icon: PackageOpen, label: adminContent.layout.menu.inventario.productos.label, key: 'productos' },
      { icon: Boxes, label: adminContent.layout.menu.inventario.insumos.label, key: 'insumos' },
      { icon: Package, label: adminContent.layout.menu.inventario.proveedores.label, key: 'proveedores' },
      { icon: AlertTriangle, label: adminContent.layout.menu.inventario.alertasStock.label, key: 'alertas-stock' },
      { icon: Archive, label: adminContent.layout.menu.inventario.stockDevuelto.label, key: 'stock-devuelto' },
    ],
  },
  {
    icon: Factory,
    label: adminContent.layout.menu.produccion.label,
    key: 'produccion',
    subItems: [
      { icon: ClipboardList, label: adminContent.layout.menu.produccion.talleres.label, key: 'talleres' },
      { icon: Workflow, label: adminContent.layout.menu.produccion.prendas.label, key: 'prendas' },
      { icon: ClipboardList, label: adminContent.layout.menu.produccion.asignacion.label, key: 'asignacion' },
      { icon: LineChart, label: adminContent.layout.menu.produccion.seguimiento.label, key: 'seguimiento' },
    ],
  },
  {
    icon: Truck,
    label: adminContent.layout.menu.domicilios.label,
    key: 'domicilios',
  },
  {
    icon: ShoppingCart,
    label: adminContent.layout.menu.ventas.label,
    key: 'ventas-pedidos',
    subItems: [
      { icon: ShoppingCart, label: adminContent.layout.menu.ventas.pedidos.label, key: 'pedidos' },
      { icon: Receipt, label: adminContent.layout.menu.ventas.facturacion.label, key: 'facturacion' },
      { icon: DollarSign, label: adminContent.layout.menu.ventas.pagos.label, key: 'pagos' },
      { icon: Users2, label: adminContent.layout.menu.ventas.clientes.label, key: 'clientes' },
    ],
  },
  {
    icon: TrendingUp,
    label: adminContent.layout.menu.reportes.label,
    key: 'reportes',
    subItems: [
      { icon: BarChart3, label: adminContent.layout.menu.reportes.ventas.label, key: 'reportes-ventas' },
      { icon: Users2, label: adminContent.layout.menu.reportes.usuarios.label, key: 'reportes-usuarios' },
      { icon: Factory, label: adminContent.layout.menu.reportes.produccion.label, key: 'reportes-produccion' },
      { icon: Package, label: adminContent.layout.menu.reportes.inventario.label, key: 'reportes-inventario' },
    ],
  },
  { icon: Store, label: adminContent.layout.menu.catalogo.label, key: 'catalogo' },
  { icon: Webhook, label: adminContent.layout.menu.webhooks.label, key: 'webhooks' },
];

export const AdminLayout: React.FC = () => {
  const [darkMode, toggleTheme] = useDashboardTheme();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('surtitelas.sidebarCollapsed') === 'true';
  });
  const navigate = useNavigate();
  const { logout } = useAuth();
  const authUser = useAuthStore(state => state.user);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    window.localStorage.setItem('surtitelas.sidebarCollapsed', String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    let active = true;
    const loadNotifications = async () => {
      try {
        const data = await notificationsApi.list();
        if (!active) return;
        setNotificationCount(data.filter(n => !n.leida).length);
      } catch {
        // silent
      }
    };
    void loadNotifications();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      const token = tokenStorage.getAccessToken();
      if (!token) return;
      try {
        await useAppStore.getState().hydrateAll();
      } finally {
        if (active) {
          // noop: hydrated or failed silently
        }
      }
    };
    void hydrate();
    return () => { active = false; };
  }, []);

  const handleLogout = async () => {
    // Clean theme state scoped to dashboards so public pages remain unaffected
    try {
      window.localStorage.removeItem('dashboard-theme');
      document.querySelectorAll<HTMLElement>('[data-dashboard-theme]').forEach(el => el.removeAttribute('data-theme'));
      document.documentElement.removeAttribute('data-theme');
      document.body?.removeAttribute('data-theme');
    } catch (_e) {
      // ignore
    }

    await logout();
    navigate('/login');
  };

  const handleSearch = (value: string) => {
    void value;
  };

  const handleNotificationClick = (path: string) => {
    navigate(path);
  };

  const handleExport = async () => {
    try {
      const report = await reportsApi.getSalesReport().catch(() => null);
      const rows: string[][] = [['Producto', 'Cantidad', 'Total']];
      if (report) {
        for (const p of report.topProducts ?? []) {
          rows.push([p.nombre, String(p.cantidad), String(p.total)]);
        }
      }
      if (rows.length === 1) {
        rows.push(['Sin datos para exportar', '', '']);
      }
      const csvContent = rows.map(e => e.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'reporte-surtitelas.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // silent
    }
  };

  const handleSidebarToggle = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  const userDisplay = {
    name: authUser?.name ?? authUser?.email ?? '',
    email: authUser?.email ?? '',
    role: authUser?.role ?? 'admin',
    initial: (authUser?.name ?? authUser?.email ?? '?').charAt(0).toUpperCase(),
  };
  const roleLabel = userDisplay.role === 'admin' ? adminContent.layout.userRoleLabels.admin : adminContent.layout.userRoleLabels.default;

  return (
    <div data-dashboard-theme className={cn(s.appLayout, isCollapsed && s.collapsed)}>
      <Sidebar
        menu={adminMenu}
        basePath="/admin"
        logo={logoImg}
        brandName={adminContent.layout.brandName}
        panelLabel={adminContent.layout.panelLabel}
        user={{ name: userDisplay.name, role: roleLabel, initials: userDisplay.initial }}
        onLogout={handleLogout}
        showCollapse={true}
        homeHref="/"
        onToggleCollapse={handleSidebarToggle}
      />

      <div className={s.mainContent}>
        <TopHeader
          user={{
            name: userDisplay.name,
            email: userDisplay.email,
            role: userDisplay.role,
            initial: userDisplay.initial,
          }}
          notificationCount={notificationCount}
          onSearch={handleSearch}
          onToggleTheme={toggleTheme}
          onExport={handleExport}
          onNotificationClick={handleNotificationClick}
          darkMode={darkMode}
        />

        <main className={s.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
