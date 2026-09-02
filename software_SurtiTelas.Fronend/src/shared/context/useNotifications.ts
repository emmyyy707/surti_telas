import { useContext } from 'react';
import { NotificationContext, type NotificationState } from './notificationContextValue';

export const useNotifications = (): NotificationState => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};