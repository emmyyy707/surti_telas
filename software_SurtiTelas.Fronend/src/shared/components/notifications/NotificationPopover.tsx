import React, { useEffect, useCallback, useRef, useState } from 'react';
import { AlertCircle, Bell, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/shared/context';
import { resolveNotificationRoute, getFallback } from '@/shared/utils/notificationRouter';
import { NotificationItem } from './NotificationItem';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import s from './NotificationPopover.module.css';

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
  notificationsPath?: string;
}

type Tab = 'all' | 'unread';

const GROUP_LABELS = {
  today: 'HOY',
  yesterday: 'AYER',
  thisWeek: 'ESTA SEMANA',
  older: 'ANTERIORES',
} as const;

const getGroupKey = (timestamp: number): keyof typeof GROUP_LABELS => {
  const now = Date.now();
  const day = 86_400_000;
  const week = 7 * day;
  const age = now - timestamp;
  if (age < day) return 'today';
  if (age < 2 * day) return 'yesterday';
  if (age < week) return 'thisWeek';
  return 'older';
};

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose,
  userRole,
  notificationsPath: _notificationsPath,
}) => {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead, deleteAll, refresh } = useNotifications();
  const [tab, setTab] = React.useState<Tab>('all');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTab('all');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = (e: Event) => {
      const target = e.target as Node | null;
      if (target && popoverRef.current?.contains(target)) return;
      onClose();
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen, onClose]);

  const handleNotificationClick = useCallback(
    async (notification: (typeof notifications)[number]) => {
      if (!notification.leida) {
        await markAsRead(notification.id);
      }
      onClose();

      const route = resolveNotificationRoute(notification.entityType, notification.entityId, userRole);
      if (route) {
        navigate(route.path);
      } else {
        navigate(getFallback(userRole));
      }
    },
    [markAsRead, userRole, onClose, navigate]
  );

  const handleMarkAllRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleDeleteAll = useCallback(async () => {
    setDeleting(true);
    await deleteAll();
    setDeleting(false);
    setDeleteConfirmOpen(false);
  }, [deleteAll]);

  const handleViewAll = useCallback(() => {
    onClose();
    navigate(getFallback(userRole));
  }, [navigate, userRole, onClose]);

  const filteredNotifications = React.useMemo(() => {
    if (tab === 'unread') {
      return notifications.filter((n) => !n.leida);
    }
    return notifications;
  }, [notifications, tab]);

  const groupedNotifications = React.useMemo(() => {
    const groups: Record<keyof typeof GROUP_LABELS, typeof notifications> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    for (const notification of filteredNotifications) {
      const key = getGroupKey(notification.createdAt);
      groups[key].push(notification);
    }

    return groups;
  }, [filteredNotifications]);

  const unreadCountText = unreadCount > 0 ? ` (${unreadCount})` : '';

  if (!isOpen) return null;

  return (
    <div ref={popoverRef} className={s.popover} role="dialog" aria-label="Notificaciones" aria-modal="false">
      <div className={s.header}>
        <div className={s.headerTop}>
          <h3 className={s.title}>Notificaciones</h3>
        </div>
        <div className={s.actions}>
          {unreadCount > 0 && (
            <button type="button" className={s.markAllReadBtn} onClick={handleMarkAllRead}>
              Marcar todas como leídas
            </button>
          )}
          {notifications.length > 0 && (
            <button type="button" className={s.deleteAllBtn} onClick={() => setDeleteConfirmOpen(true)}>
              <Trash2 size={14} />
              Vaciar bandeja
            </button>
          )}
        </div>
      </div>

      <div className={s.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'all'}
          className={`${s.tab} ${tab === 'all' ? s.tabActive : ''}`}
          onClick={() => setTab('all')}
        >
          Todas
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'unread'}
          className={`${s.tab} ${tab === 'unread' ? s.tabActive : ''}`}
          onClick={() => setTab('unread')}
        >
          No leídas{unreadCountText}
        </button>
      </div>

      <div className={s.list}>
        {loading && (
          <div className={s.loadingState}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={s.skeletonItem}>
                <div className={s.skeletonIcon} />
                <div className={s.skeletonBody}>
                  <div className={s.skeletonLine} />
                  <div className={s.skeletonLineShort} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className={s.errorState}>
            <AlertCircle size={32} className={s.errorIcon} />
            <p className={s.errorText}>No pudimos cargar las notificaciones.</p>
            <button type="button" className={s.retryBtn} onClick={refresh}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && filteredNotifications.length === 0 && (
          <div className={s.emptyState}>
            <Bell size={32} className={s.emptyIcon} />
            <p className={s.emptyTitle}>{tab === 'unread' ? 'Estás al día' : 'Todo al día'}</p>
            <p className={s.emptyText}>
              {tab === 'unread' ? 'No tienes notificaciones sin leer.' : 'No tienes notificaciones nuevas.'}
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          filteredNotifications.length > 0 &&
          (Object.keys(GROUP_LABELS) as Array<keyof typeof GROUP_LABELS>).map((groupKey) => {
            const items = groupedNotifications[groupKey];
            if (items.length === 0) return null;

            return (
              <div key={groupKey} className={s.group}>
                <div className={s.groupLabel}>{GROUP_LABELS[groupKey]}</div>
                <div className={s.groupItems}>
                  {items.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={handleNotificationClick}
                    />
                  ))}
                </div>
              </div>
            );
          })}
      </div>

      <div className={s.footer}>
        <button type="button" className={s.viewAllBtn} onClick={handleViewAll}>
          Ver todas las notificaciones
        </button>
      </div>

      <ConfirmationModal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteAll}
        title="Vaciar bandeja"
        description="¿Estás seguro de que deseas eliminar todas tus notificaciones? Esta acción no se puede deshacer."
        confirmLabel="Vaciar bandeja"
        cancelLabel="Cancelar"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};
