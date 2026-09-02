import React from 'react';
import { type Notification } from '@/infrastructure/api/notificationsApi';
import { NotificationIcon } from './NotificationIcon';
import { timeAgo } from '@/shared/utils/relativeTime';
import s from './NotificationItem.module.css';

export interface NotificationItemProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
  className?: string;
}

const getContext = (notification: Notification): string | null => {
  if (notification.metadata?.entityName) return notification.metadata.entityName as string;
  if (notification.referenciaId) return `#${notification.referenciaId}`;
  return null;
};

export const NotificationItem = ({ notification, onClick, className }: NotificationItemProps) => {
  const context = getContext(notification);

  const handleClick = () => {
    onClick?.(notification);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(notification);
    }
  };

  const ariaLabel = `${notification.titulo}${notification.leida ? '' : ', no leída'}`;

  return (
    <button
      type="button"
      className={`${s.item} ${!notification.leida ? s.unread : ''} ${className ?? ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
    >
      <NotificationIcon entityType={notification.entityType} tipo={notification.tipo} />
      <div className={s.body}>
        <p className={s.title}>{notification.titulo}</p>
        {context && <p className={s.context}>{context}</p>}
        <p className={s.message}>{notification.mensaje}</p>
        <div className={s.footer}>
          <span className={s.time}>{timeAgo(notification.createdAt)}</span>
          {!notification.leida && <span className={s.unreadDot} aria-hidden="true" />}
        </div>
      </div>
    </button>
  );
};
