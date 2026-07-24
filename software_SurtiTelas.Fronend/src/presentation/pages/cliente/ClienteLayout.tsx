import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, ShoppingBag, UserCircle, Route, ReceiptText, Heart } from 'lucide-react';
import s from '../../../styles/admin/AdminLayout.module.css';
import { Sidebar, SidebarItem } from '@/shared/layouts/Sidebar';
import { useAuth } from '@/app/providers/AppProviders';
import { useDashboardTheme } from '@/core/hooks/useDashboardTheme';
import { TopHeader } from '@/presentation/components/TopHeader';
import { cn } from '@/shared/utils';
import { useAuthStore } from '@/core/stores/authStore';
import { authApi } from '@/infrastructure/api/authApi';
import { notificationsApi } from '@/infrastructure/api/notificationsApi';
import logoImg from '@/assets/images/logos/partner-logo-2-Photoroom.png';

const clienteMenu: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Inicio', key: 'inicio' },
  { icon: MessageSquare, label: 'Servicio al Cliente', key: 'catalogo' },
  { icon: ShoppingBag, label: 'Mis Pedidos', key: 'pedidos' },
  { icon: ReceiptText, label: 'Mis Recibos', key: 'recibos' },
  { icon: Heart, label: 'Mis Favoritos', key: 'favoritos' },
  { icon: Route, label: 'Seguimiento', key: 'seguimiento' },
  { icon: UserCircle, label: 'Mi Perfil', key: 'perfil' },
];

export const ClienteLayout: React.FC = () => {
  const [darkMode, toggleTheme] = useDashboardTheme();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('surtitelas.sidebarCollapsed') === 'true';
  });
  const navigate = useNavigate();
  const { logout } = useAuth();
  const storeUser = useAuthStore((s) => s.user);
  const [sidebarUser, setSidebarUser] = useState({ name: 'Cargando...', role: 'cliente', initials: '' });
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const profile = await authApi.me();
        if (!active) return;
        const initials = profile.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        setSidebarUser({ name: profile.nombre, role: 'cliente', initials });
      } catch {
        if (storeUser) {
          const initials = storeUser.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '';
          setSidebarUser({ name: storeUser.name ?? 'Cliente', role: 'cliente', initials });
        }
      }
    };
    void load();
    return () => { active = false; };
  }, [storeUser]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const notifs = await notificationsApi.list();
        if (!active) return;
        setNotificationCount(notifs.filter(n => !n.leida).length);
      } catch {
        setNotificationCount(0);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    window.localStorage.setItem('surtitelas.sidebarCollapsed', String(isCollapsed));
  }, [isCollapsed]);

  const handleLogout = async () => {
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

  const handleSidebarToggle = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  const handleNotificationClick = (path: string) => {
    navigate(path);
  };

  return (
    <div data-dashboard-theme className={cn(s.appLayout, isCollapsed && s.collapsed)}>
      <Sidebar
        menu={clienteMenu}
        basePath="/cliente"
        logo={logoImg}
        brandName="SURTI CAMISETAS"
        panelLabel="Portal Cliente"
        user={sidebarUser}
        onLogout={handleLogout}
        showCollapse={true}
        homeHref="/"
        onToggleCollapse={handleSidebarToggle}
      />
      <div className={s.mainContent}>
        <TopHeader
          user={{
            name: sidebarUser.name,
            email: storeUser?.email ?? '',
            role: 'cliente',
            initial: sidebarUser.initials,
          }}
          notificationCount={notificationCount}
          onSearch={() => {}}
          onToggleTheme={toggleTheme}
          onNotificationClick={handleNotificationClick}
          darkMode={darkMode}
        />
        <main className={s.pageContent}><Outlet /></main>
      </div>
    </div>
  );
};
