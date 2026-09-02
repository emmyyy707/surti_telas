import { createContext } from 'react';
import type { useRealtimeNotifications } from '@/shared/hooks/useRealtimeNotifications';

export type NotificationState = ReturnType<typeof useRealtimeNotifications>;

export const NotificationContext = createContext<NotificationState | null>(null);