import React, { useState, useCallback } from 'react';
import { Search, Bell, Moon, Download, Sun } from 'lucide-react';
import s from './TopHeader.module.css';
import { Tooltip } from '@/shared/components/Tooltip';
import { useNotifications } from '@/shared/context';
import { NotificationPopover } from '@/shared/components/notifications/NotificationPopover';

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

export const TopHeader: React.FC<TopHeaderProps> = ({
  user,
  onSearch,
  onToggleTheme,
  onExport,
  darkMode = false,
  notificationsPath = '/admin/notificaciones',
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotifications();

  const handleCloseNotifications = useCallback(() => {
    setShowNotifications(false);
  }, []);

  const handleToggleNotifications = useCallback(() => {
    setShowNotifications((prev) => !prev);
  }, []);

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
        <div className={s.notificationWrapper}>
          <Tooltip title="Notificaciones">
            <button
              className={s.iconBtn}
              onClick={handleToggleNotifications}
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
            <NotificationPopover
              isOpen={showNotifications}
              onClose={handleCloseNotifications}
              userRole={user.role}
              notificationsPath={notificationsPath}
            />
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
