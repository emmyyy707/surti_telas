import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Moon, Download, Sun, Package, ShoppingCart, AlertTriangle, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import s from './TopHeader.module.css';
import { cn } from '@/shared/utils';
import { Tooltip } from '@/shared/components/Tooltip';
import { notificationsApi } from '@/infrastructure/api/notificationsApi';
import { tokenStorage } from '@/infrastructure/api/tokenStorage';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'stock' | 'message' | 'info';
  read: boolean;
  path: string;
}

interface TopHeaderProps {
  user: {
    name: string;
    email: string;
    role: 'admin' | 'almacen' | 'asesor' | 'domiciliario' | 'cliente' | 'produccion' | 'reportes';
    initial: string;
  };
  notificationCount: number;
  onSearch: (value: string) => void;
  onToggleTheme: () => void;
  onExport?: () => void;
  onNotificationClick?: (path: string) => void;
  notifications?: Notification[];
  darkMode?: boolean;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'order': return <ShoppingCart size={16} />;
    case 'stock': return <AlertTriangle size={16} />;
    case 'message': return <MessageSquare size={16} />;
    default: return <Package size={16} />;
  }
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  user,
  notificationCount,
  onSearch,
  onToggleTheme,
  onExport,
  onNotificationClick,
  notifications,
  darkMode = false,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [fetchedNotifications, setFetchedNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState<boolean>(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const showExport = user.role === 'admin' || typeof onExport === 'function';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!tokenStorage.getAccessToken()) return;
      setLoadingNotifications(true);
      setNotificationsError(null);
      try {
        const data = await notificationsApi.list();
        if (!active) return;
        const mapped: Notification[] = data.map(n => ({
          id: n.id,
          title: n.titulo,
          message: n.mensaje,
          time: new Date(n.createdAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }),
          type: n.tipo === 'success' ? 'order' : n.tipo === 'danger' ? 'stock' : n.tipo === 'warning' ? 'message' : 'info',
          read: n.leida,
          path: '/admin/notificaciones',
        }));
        setFetchedNotifications(mapped);
      } catch (err) {
        if (!active) return;
        setNotificationsError(err instanceof Error ? err.message : 'No se pudieron cargar las notificaciones');
      } finally {
        if (active) setLoadingNotifications(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const notificationsList = notifications ?? fetchedNotifications;
  const effectiveCount = notificationCount > 0 ? notificationCount : notificationsList.filter(n => !n.read).length;

  return (
    <header className={s.header}>
      <div className={s.headerLeft}>
        <div className={s.searchWrapper}>
          <Search size={18} className={s.searchIcon} />
          <input
            type="text"
            placeholder="Buscar..."
            className={s.searchInput}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={s.headerRight}>
        <div className={s.notificationWrapper} ref={dropdownRef}>
          <Tooltip title="Notificaciones">
            <button
              className={s.iconBtn}
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notificaciones"
            >
              <Bell size={20} />
            </button>
          </Tooltip>
          {effectiveCount > 0 && (
            <span className={s.badge}>{effectiveCount}</span>
          )}
          {showNotifications && (
            <div className={s.notificationsDropdown}>
              <div className={s.notificationsHeader}>
                <h3>Notificaciones</h3>
                <span className={s.notificationsCount}>{effectiveCount} nuevas</span>
              </div>
              <div className={s.notificationsList}>
                {loadingNotifications && (
                  <div className={cn(s.emptyNotifications, s.loadingState)}>
                    <Loader2 size={32} className={cn(s.emptyIcon, s.spin)} />
                    <p>Cargando notificaciones...</p>
                  </div>
                )}
                {notificationsError && (
                  <div className={cn(s.emptyNotifications, s.errorState)}>
                    <AlertCircle size={32} className={s.emptyIcon} />
                    <p>{notificationsError}</p>
                  </div>
                )}
                {!loadingNotifications && !notificationsError && notificationsList.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(s.notificationItem, !notification.read && s.unread)}
                    onClick={() => {
                      setShowNotifications(false);
                      onNotificationClick?.(notification.path);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={s.notificationIcon}>{getNotificationIcon(notification.type)}</div>
                    <div className={s.notificationContent}>
                      <h4 className={s.notificationTitle}>{notification.title}</h4>
                      <p className={s.notificationMessage}>{notification.message}</p>
                      <span className={s.notificationTime}>{notification.time}</span>
                    </div>
                    {!notification.read && <div className={s.unreadDot} />}
                  </div>
                ))}
                {!loadingNotifications && !notificationsError && notificationsList.length === 0 && (
                  <div className={s.emptyNotifications}>
                    <Bell size={32} className={s.emptyIcon} />
                    <p>No hay notificaciones nuevas</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <Tooltip title="Cambiar tema">
          <button
            className={s.iconBtn}
            onClick={onToggleTheme}
            aria-label="Cambiar tema"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </Tooltip>

        {showExport && (
          <Tooltip title="Exportar">
            <button className={s.exportBtn} onClick={onExport}>
              <Download size={16} />
              <span>Exportar</span>
            </button>
          </Tooltip>
        )}

        <div className={s.userProfile}>
          <div className={s.avatar}>{user.initial}</div>
          <div className={s.userInfo}>
            <span className={s.userName}>{user.name}</span>
            <span className={s.userEmail}>{user.email}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
