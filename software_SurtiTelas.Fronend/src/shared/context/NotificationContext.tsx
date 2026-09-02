import React from 'react';
import { useRealtimeNotifications } from '@/shared/hooks/useRealtimeNotifications';
import { useAuth } from '@/core/stores/authStore';
import { NotificationContext, type NotificationState } from './notificationContextValue';

export type { NotificationState };

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, sessionChecked } = useAuth();
  const enabled = sessionChecked && isAuthenticated;
  const value = useRealtimeNotifications(enabled);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};