import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationsApi, type Notification } from '@/infrastructure/api/notificationsApi';
import { tokenStorage } from '@/infrastructure/api/tokenStorage';
import { ApiError } from '@/infrastructure/api/httpClient';
import { useAuthStore } from '@/core/stores/authStore';

const POLL_INTERVAL_MS = 30_000;

export function useRealtimeNotifications(enabled = true) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarSummary, setSidebarSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    const token = tokenStorage.getAccessToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [items, count, summary] = await Promise.all([
        notificationsApi.list(),
        notificationsApi.getUnreadCount(),
        notificationsApi.getSidebarSummary(),
      ]);
      setNotifications(items);
      setUnreadCount(count);
      setSidebarSummary(summary);
    } catch (err) {
      if (!enabled) return;
      if (err instanceof ApiError && err.status === 401) {
        tokenStorage.clear();
        useAuthStore.setState({ user: null, isAuthenticated: false, sessionChecked: true });
        return;
      }
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
      setSidebarSummary((prev) => {
        const next = { ...prev };
        const notif = notifications.find((n) => n.id === id);
        if (notif?.modulo && next[notif.modulo] && next[notif.modulo] > 0) {
          next[notif.modulo] -= 1;
        }
        return next;
      });
    }
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    const ok = await notificationsApi.markAllAsRead();
    if (ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
      setUnreadCount(0);
      setSidebarSummary({});
    }
  }, []);

  const deleteAll = useCallback(async () => {
    const ok = await notificationsApi.deleteAll();
    if (ok) {
      setNotifications([]);
      setUnreadCount(0);
      setSidebarSummary({});
    }
  }, []);

  return {
    notifications,
    unreadCount,
    sidebarSummary,
    loading,
    error,
    refresh: load,
    markAsRead,
    markAllAsRead,
    deleteAll,
  };
}
