import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings2, Users, UserCog, Shield, Package, PackageOpen, Boxes, FolderTree, AlertTriangle, Archive, Factory, Workflow, ClipboardList, ShoppingCart, Receipt, UserSearch, BarChart3, TrendingUp, Users2, LineChart, Store, Truck, UserCheck, DollarSign, KeyRound, Webhook, Bug, MapPin, FileText, ShoppingBag, Tags } from 'lucide-react';

import s from '../../../styles/admin/AdminLayout.module.css';
import { Sidebar, SidebarItem } from '@/shared/layouts/Sidebar';
import { useAuth } from '@/app/providers/AppProviders';
import { useAuthStore } from '@/core/stores/authStore';
import { useDashboardTheme } from '@/core/hooks/useDashboardTheme';
import { useUserRole, clearUserRole } from '@/core/hooks/useUserRole';
import { TopHeader } from '@/presentation/components/TopHeader';
import { cn } from '@/shared/utils';
import logoImg from '@/assets/images/logos/partner-logo-2-Photoroom.png';
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
      { icon: FolderTree, label: adminContent.layout.menu.inventario.categorias.label, key: 'categorias' },
      { icon: AlertTriangle, label: adminContent.layout.menu.inventario.alertasStock.label, key: 'alertas-stock' },
      { icon: Archive, label: adminContent.layout.menu.inventario.stockDevuelto.label, key: 'stock-devuelto' },
      { icon: Store, label: adminContent.layout.menu.catalogo.label, key: 'catalogo' },
    ],
  },
  {
    icon: ShoppingBag,
    label: adminContent.layout.menu.inventario.compras.label,
    key: 'compras',
    subItems: [
      { icon: ShoppingBag, label: adminContent.layout.menu.inventario.compras.label, key: 'compras' },
      { icon: Boxes, label: adminContent.layout.menu.inventario.insumos.label, key: 'insumos' },
      { icon: Tags, label: adminContent.layout.menu.inventario.categoriasInsumos.label, key: 'categorias-insumos' },
      { icon: Package, label: adminContent.layout.menu.inventario.proveedores.label, key: 'proveedores' },
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
    subItems: [
      { icon: Users2, label: 'Domiciliarios', key: 'domicilios' },
      { icon: MapPin, label: 'Ruta del Día', key: 'ruta-del-dia' },
    ],
  },
  {
    icon: ShoppingCart,
    label: adminContent.layout.menu.ventas.label,
    key: 'ventas-pedidos',
    subItems: [
      { icon: ShoppingCart, label: adminContent.layout.menu.ventas.pedidos.label, key: 'pedidos' },
      { icon: FileText, label: 'Cotizaciones', key: 'pedidos-personalizados' },
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
      { icon: BarChart3, label: adminContent.layout.menu.reportes.ventas.label, key: 'reportes/ventas' },
      { icon: DollarSign, label: adminContent.layout.menu.finanzas.label, key: 'reportes/finanzas' },
      { icon: Users2, label: adminContent.layout.menu.reportes.usuarios.label, key: 'reportes/usuarios' },
      { icon: Factory, label: adminContent.layout.menu.reportes.produccion.label, key: 'reportes/produccion' },
      { icon: Package, label: adminContent.layout.menu.reportes.inventario.label, key: 'reportes/inventario' },
    ],
  },
];

export const AdminLayout: React.FC = () => {
  useUserRole('admin');
  const [darkMode, toggleTheme] = useDashboardTheme();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('surtitelas.sidebarCollapsed') === 'true';
  });
  const navigate = useNavigate();
  const { logout } = useAuth();
  const authUser = useAuthStore(state => state.user);
  const [notificationCount, setNotificationCount] = useState(0);
  const [debugOpen, setDebugOpen] = useState(false);

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
    const interval = setInterval(loadNotifications, 30000);
    return () => { active = false; clearInterval(interval); };
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

  const location = useLocation();

  const isActive = useCallback(
    (itemKey: string) => {
      const path = location.pathname;
      if (itemKey === 'dashboard' && (path === '/admin/' || path === '/admin/dashboard')) {
        return true;
      }
      if (itemKey === 'inventario') {
        return path.includes('/inventario') || path.includes('/catalogo');
      }
      if (itemKey === 'domicilios') {
        return path.includes('/domicilios') || path.includes('/ruta-del-dia');
      }
      if (itemKey === 'configuracion') {
        return path.includes('/configuracion') || path.includes('/roles') || path.includes('/permisos') || path.includes('/webhooks');
      }
      return path.includes(`/${itemKey}`);
    },
    [location.pathname]
  );

  const handleLogout = async () => {
    // Clean theme state scoped to dashboards so public pages remain unaffected
    try {
      window.localStorage.removeItem('dashboard-theme');
      document.querySelectorAll<HTMLElement>('[data-dashboard-theme]').forEach(el => el.removeAttribute('data-theme'));
      document.documentElement.removeAttribute('data-theme');
      document.body?.removeAttribute('data-theme');
      clearUserRole();
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
    avatar: authUser?.avatar ?? null,
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
        isActive={isActive}
      />

      <div className={s.mainContent}>
        <TopHeader
          user={{
            name: userDisplay.name,
            email: userDisplay.email,
            role: userDisplay.role,
            initial: userDisplay.initial,
            avatar: userDisplay.avatar,
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

      {import.meta.env.DEV && authUser && (
        <>
          <button
            type="button"
            onClick={() => setDebugOpen((prev) => !prev)}
            style={{
              position: 'fixed',
              right: '16px',
              bottom: '16px',
              zIndex: 9999,
              padding: '10px 12px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(0,0,0,0.55)',
              color: '#fff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
            }}
          >
            <Bug size={16} />
            {debugOpen ? 'Ocultar debug' : 'Debug permisos'}
          </button>

          {debugOpen && (
            <div style={{ position: 'fixed', right: '16px', bottom: '56px', zIndex: 9999, width: '420px', maxHeight: '70vh', overflow: 'auto', padding: '14px 16px', background: 'rgba(15,15,20,0.92)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '14px', color: 'var(--color-text-secondary)', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Debug permisos</strong>
                <button type="button" onClick={async () => { await useAuthStore.getState().checkSession(); window.location.reload(); }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.25)', color: 'inherit', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer' }}>Refrescar</button>
              </div>
              <div>email: {authUser.email}</div>
              <div>role: {authUser.role}</div>
              <div style={{ wordBreak: 'break-all' }}>permissions: {JSON.stringify(authUser.permissions)}</div>
              <div>menu visible: {(adminMenu as SidebarItem[]).map((item) => item.label ?? item.key ?? 'item').join(', ') || 'â€”'}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
};





