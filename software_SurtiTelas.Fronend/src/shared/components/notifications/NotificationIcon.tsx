import React from 'react';
import { getNotificationIcon, NOTIFICATION_ICON_MAP } from '@/shared/utils/notificationRouter';
import s from './NotificationIcon.module.css';

interface NotificationIconProps {
  entityType?: string;
  tipo: string;
  className?: string;
}

export const NotificationIcon = ({ entityType, tipo, className }: NotificationIconProps) => {
  const iconName = getNotificationIcon(entityType, tipo);
  const IconComponent = NOTIFICATION_ICON_MAP[iconName] ?? NOTIFICATION_ICON_MAP['Info'];

  return (
    <div className={`${s.icon} ${s[`priority-${tipo}`]} ${className ?? ''}`}>
      <IconComponent size={16} strokeWidth={2} />
    </div>
  );
};
