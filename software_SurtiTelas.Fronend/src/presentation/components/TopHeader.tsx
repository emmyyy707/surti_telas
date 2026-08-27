import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Bell, Moon, Download, Sun, Package, ShoppingCart, AlertTriangle, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import s from './TopHeader.module.css';
import { cn } from '@/shared/utils';
import { Tooltip } from '@/shared/components/Tooltip';
import { useRealtimeNotifications } from '@/shared/hooks/useRealtimeNotifications';
import { tokenStorage } from '@/infrastructure/api/tokenStorage';
import { useNavigate } from 'react-router-dom';

interface TopHeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
    initial: string;
    avatar?: string | null;
  };
  onSearch: (value: string) => void;
  onToggleTheme: () => void;
  onExport?: () => void;
  darkMode?: boolean;
  notificationsPath?: string;
}

const getNotificationIcon = (tipo: string) => {
  switch (tipo) {
    case 'success': return <ShoppingCart size={16} />;
    case 'danger': return <AlertTriangle size={16} />;
    case 'warning': return <MessageSquare size={16} />;
    default: return <Package size={16} />;
  }
};

const timeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Hace un momento';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  user,
  onSearch,
  onToggleTheme,
  onExport,
  darkMode = false,
  notificationsPath = '/admin/notificaciones',
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const hasAccess = !!tokenStorage.getAccessToken();
  const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead } = useRealtimeNotifications(hasAccess);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = useCallback(async (notif: typeof notifications[number]) => {
    if (!notif.leida) {
      await markAsRead(notif.id);
    }
    setShowNotifications(false);
    if (notif.entityType && notif.entityId) {
      const role = user.role;
      const base = role === 'admin' ? '/admin' : role === 'asesor' ? '/asesor' : role === 'cliente' ? '/cliente' : role === 'domiciliario' ? '/domiciliario' : '/admin';
      const pathMap: Record<string, string> = {
        ORDER: role === 'domiciliario' ? `${base}/entregas` : `${base}/pedidos`,
        DELIVERY: role === 'domiciliario' ? `${base}/entregas` : `${base}/domicilios`,
        PRODUCT: role === 'cliente' ? '/catalogo' : `${base}/catalogo`,
        USER: role === 'admin' ? `${base}/gestion-usuarios` : notificationsPath,
        RECEIPT: role === 'cliente' ? `${base}/recibos` : `${base}/facturacion`,
        PAYMENT: role === 'admin' ? `${base}/pagos` : notificationsPath,
        CUSTOMER: role === 'admin' ? `${base}/clientes` : role === 'asesor' ? `${base}/clientes` : notificationsPath,
        PRODUCTION_ORDER: role === 'admin' ? `${base}/produccion` : notificationsPath,
        RAW_MATERIAL: role === 'admin' ? `${base}/inventario` : notificationsPath,
      };
      const target = pathMap[notif.entityType] || notificationsPath;
      navigate(target);
    } else {
      navigate(notificationsPath);
    }
  }, [markAsRead, navigate, notificationsPath, user.role]);

  const handleMarkAllRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const showExport = user.role === 'admin' || typeof onExport === 'function';

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
              aria-expanded={showNotifications}
            >
              <Bell size={20} />
            </button>
          </Tooltip>
          {unreadCount > 0 && (
            <span className={s.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
          {showNotifications && (
            <div className={s.notificationsDropdown} role="menu" aria-label="Notificaciones">
              <div className={s.notificationsHeader}>
                <h3>Notificaciones</h3>
                <div className={s.notificationsHeaderActions}>
                  {unreadCount > 0 && (
                    <button type="button" className={s.markAllReadBtn} onClick={handleMarkAllRead}>
                      Marcar todas como leídas
                    </button>
                  )}
                  <button type="button" className={s.viewAllBtn} onClick={() => { setShowNotifications(false); navigate(notificationsPath); }}>
                    Ver todas
                  </button>
                </div>
              </div>
              <div className={s.notificationsList}>
                {loading && (
                  <div className={cn(s.emptyNotifications, s.loadingState)}>
                    <Loader2 size={32} className={cn(s.emptyIcon, s.spin)} />
                    <p>Cargando notificaciones...</p>
                  </div>
                )}
                {error && (
                  <div className={cn(s.emptyNotifications, s.errorState)}>
                    <AlertCircle size={32} className={s.emptyIcon} />
                    <p>{error}</p>
                  </div>
                )}
                {!loading && !error && notifications.length === 0 && (
                  <div className={s.emptyNotifications}>
                    <Bell size={32} className={s.emptyIcon} />
                    <p>No hay notificaciones nuevas</p>
                  </div>
                )}
                {!loading && !error && notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(s.notificationItem, !notification.leida && s.unread)}
                    onClick={() => handleNotificationClick(notification)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNotificationClick(notification); } }}
                    role="menuitem"
                    tabIndex={0}
                  >
                    <div className={s.notificationIcon}>{getNotificationIcon(notification.tipo)}</div>
                    <div className={s.notificationContent}>
                      <h4 className={s.notificationTitle}>{notification.titulo}</h4>
                      <p className={s.notificationMessage}>{notification.mensaje}</p>
                      <span className={s.notificationTime}>{timeAgo(notification.createdAt)}</span>
                    </div>
                    {!notification.leida && <div className={s.unreadDot} />}
                  </div>
                ))}
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
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className={s.avatarImage} />
          ) : (
            <div className={s.avatar}>{user.initial}</div>
          )}
          <div className={s.userInfo}>
            <span className={s.userName}>{user.name}</span>
            <span className={s.userEmail}>{user.email}</span>
          </div>
        </div>
      </div>
    </header>
  );
};