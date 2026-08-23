import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationsApi, type Notification } from '@/infrastructure/api/notificationsApi';

const POLL_INTERVAL_MS = 30_000;

export function useRealtimeNotifications(enabled = true) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const [items, count] = await Promise.all([
        notificationsApi.list(),
        notificationsApi.getUnreadCount(),
      ]);
      setNotifications(items);
      setUnreadCount(count);
    } catch (err) {
      if (!enabled) return;
      setError(err instanceof Error ? err.message : 'Error cargando notificaciones');
    } finally {
      if (enabled) setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!enabled) return;
    intervalRef.current = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, load]);

  const markAsRead = useCallback(async (id: string) => {
    const updated = await notificationsApi.markAsRead(id);
    if (updated) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const ok = await notificationsApi.markAllAsRead();
    if (ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
      setUnreadCount(0);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: load,
    markAsRead,
    markAllAsRead,
  };
}
