import React, { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, EyeOff, ExternalLink, AlertCircle, MoreHorizontal } from 'lucide-react';
import s from './AdminNotificaciones.module.css';
import f from '@/styles/Form.module.css';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { notificationsApi, type Notification } from '@/infrastructure/api/notificationsApi';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { ModalFooter } from '@/shared/ui/ModalFooter';
import { useNavigate } from 'react-router-dom';
import { resolveNotificationRoute } from '@/shared/utils/notificationRouter';
import { useNotifications } from '@/shared/context';
import { NotificationItem } from '@/shared/components/notifications/NotificationItem';
import { DropdownMenu, type DropdownItem } from '@/shared/ui/DropdownMenu';

const TIPO_OPTIONS = [
  { value: 'INFO', label: 'Info' },
  { value: 'WARNING', label: 'Advertencia' },
  { value: 'SUCCESS', label: 'Éxito' },
  { value: 'DANGER', label: 'Peligro' },
] as const;

const MODULO_LABEL_MAP: Record<string, string> = {
  ORDERS: 'Pedidos',
  PEDIDOS_PERSONALIZADOS: 'Pedidos personalizados',
  PRODUCTION: 'Producción',
  CATALOG: 'Catálogo',
  CUSTOMERS: 'Clientes',
  DELIVERIES: 'Domicilios',
  PAYMENTS: 'Pagos',
  RECEIPTS: 'Facturación',
  RETURNS: 'Devoluciones',
  USERS: 'Usuarios',
  STOCK: 'Existencias',
};

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

export const AdminNotificaciones: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Notification | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Notification | null>(null);

  const [formTitulo, setFormTitulo] = useState('');
  const [formMensaje, setFormMensaje] = useState('');
  const [formTipo, setFormTipo] = useState<Notification['tipo']>('info');
  const [formLeida, setFormLeida] = useState(false);

  const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead, refresh } = useNotifications();

  const moduleFilters = useMemo(() => {
    const modules = new Map<string, string>();
    for (const n of notifications) {
      if (n.modulo && !modules.has(n.modulo)) {
        modules.set(n.modulo, MODULO_LABEL_MAP[n.modulo] ?? n.modulo);
      }
    }
    return Array.from(modules.entries()).map(([key, label]) => ({ key, label }));
  }, [notifications]);

  const moduleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const n of notifications) {
      if (n.modulo) {
        counts[n.modulo] = (counts[n.modulo] || 0) + 1;
      }
    }
    return counts;
  }, [notifications]);

  const displayNotifications = useMemo(() => {
    let result = notifications;

    if (filter === 'unread') {
      result = result.filter((n) => !n.leida);
    } else if (filter !== 'all') {
      result = result.filter((n) => n.modulo === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((n) =>
        n.titulo.toLowerCase().includes(q) ||
        n.mensaje.toLowerCase().includes(q) ||
        (n.metadata?.entityName && String(n.metadata.entityName).toLowerCase().includes(q)) ||
        (n.referenciaId && String(n.referenciaId).toLowerCase().includes(q)) ||
        (n.modulo && n.modulo.toLowerCase().includes(q))
      );
    }

    return result;
  }, [notifications, filter, search]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<keyof typeof GROUP_LABELS, Notification[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    for (const notification of displayNotifications) {
      const key = getGroupKey(notification.createdAt);
      groups[key].push(notification);
    }

    return Object.entries(groups)
      .map(([key, items]) => ({
        key: key as keyof typeof GROUP_LABELS,
        label: GROUP_LABELS[key as keyof typeof GROUP_LABELS],
        items,
      }))
      .filter((g) => g.items.length > 0);
  }, [displayNotifications]);

  const handleMarkAllRead = useCallback(async () => {
    await markAllAsRead();
    toast.success('Todas las notificaciones marcadas como leídas');
  }, [markAllAsRead]);

  const openCreateModal = useCallback(() => {
    setEditingItem(null);
    setFormTitulo('');
    setFormMensaje('');
    setFormTipo('info');
    setFormLeida(false);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((item: Notification) => {
    setEditingItem(item);
    setFormTitulo(item.titulo);
    setFormMensaje(item.mensaje);
    setFormTipo(item.tipo);
    setFormLeida(item.leida);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingItem(null);
    setFormTitulo('');
    setFormMensaje('');
    setFormTipo('info');
    setFormLeida(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitulo.trim() || !formMensaje.trim()) {
      toast.error('Título y mensaje son obligatorios');
      return;
    }
    setSaving(true);
    try {
      if (editingItem) {
        await notificationsApi.update(editingItem.id, { titulo: formTitulo, mensaje: formMensaje, leida: formLeida });
        toast.success('Notificación actualizada');
      } else {
        await notificationsApi.create({ titulo: formTitulo, mensaje: formMensaje, tipo: formTipo.toUpperCase() as 'INFO' | 'WARNING' | 'SUCCESS' | 'DANGER' });
        toast.success('Notificación creada');
      }
      closeModal();
      void refresh();
    } catch {
      toast.error(editingItem ? 'No se pudo actualizar la notificación' : 'No se pudo crear la notificación');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    try {
      await notificationsApi.delete(deleteConfirm.id);
      toast.success('Notificación eliminada');
      void refresh();
    } catch {
      toast.error('No se pudo eliminar la notificación');
    } finally {
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, refresh]);

  const handleItemClick = useCallback(async (item: Notification) => {
    if (!item.leida) {
      await markAsRead(item.id);
    }
    const route = resolveNotificationRoute(item.entityType, item.entityId, 'admin');
    if (route) {
      navigate(route.path);
    }
  }, [markAsRead, navigate]);

  const getItemActions = useCallback((item: Notification): DropdownItem[] => {
    const actions: DropdownItem[] = [];

    const route = resolveNotificationRoute(item.entityType, item.entityId, 'admin');
    if (route) {
      actions.push({
        label: 'Ver entidad',
        icon: <ExternalLink size={14} />,
        onClick: async () => {
          if (!item.leida) {
            await markAsRead(item.id);
          }
          navigate(route.path);
        },
      });
      actions.push({ divider: true });
    }

    actions.push({
      label: item.leida ? 'Marcar como no leída' : 'Marcar como leída',
      icon: item.leida ? <EyeOff size={14} /> : <Eye size={14} />,
      onClick: async () => {
        await notificationsApi.update(item.id, { leida: !item.leida });
        toast.success(item.leida ? 'Marcada como no leída' : 'Marcada como leída');
        void refresh();
      },
    });

    actions.push({
      label: 'Editar',
      icon: <Edit size={14} />,
      onClick: () => openEditModal(item),
    });

    actions.push({
      label: 'Eliminar',
      icon: <Trash2 size={14} />,
      onClick: () => setDeleteConfirm(item),
      danger: true,
    });

    return actions;
  }, [markAsRead, navigate, refresh, openEditModal]);

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.headerInfo}>
          <h1 className={s.pageTitle}>Notificaciones</h1>
          <p className={s.pageSubtitle}>Actividad y eventos importantes de tu cuenta.</p>
          {unreadCount > 0 ? (
            <span className={s.unreadCount}>{unreadCount} sin leer</span>
          ) : (
            <span className={s.unreadCount}>Todo al día</span>
          )}
        </div>
        <div className={s.headerActions}>
          <Button variant="secondary" onClick={handleMarkAllRead}>Marcar todas como leídas</Button>
          <Button variant="primary" onClick={openCreateModal} leftIcon={<Plus size={16} />}>Nueva notificación</Button>
        </div>
      </div>

      <div className={s.toolbar}>
        <div className={s.filterTabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            className={`${s.filterTab} ${filter === 'all' ? s.filterTabActive : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas ({notifications.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'unread'}
            className={`${s.filterTab} ${filter === 'unread' ? s.filterTabActive : ''}`}
            onClick={() => setFilter('unread')}
          >
            No leídas ({unreadCount})
          </button>
          {moduleFilters.map((m) => (
            <button
              key={m.key}
              type="button"
              role="tab"
              aria-selected={filter === m.key}
              className={`${s.filterTab} ${filter === m.key ? s.filterTabActive : ''}`}
              onClick={() => setFilter(m.key)}
            >
              {m.label} ({moduleCounts[m.key] || 0})
            </button>
          ))}
        </div>
        <div className={s.searchBox}>
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar notificaciones..." debounceMs={200} minChars={0} />
        </div>
      </div>

      {error && !loading && (
        <div className={s.errorState}>
          <AlertCircle size={32} className={s.errorIcon} />
          <p className={s.errorText}>No pudimos cargar las notificaciones.</p>
          <button type="button" className={s.retryBtn} onClick={refresh}>Reintentar</button>
        </div>
      )}

      {!error && loading && (
        <div className={s.loadingState}>
          {Array.from({ length: 5 }).map((_, i) => (
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

      {!error && !loading && displayNotifications.length === 0 && (
        <div className={s.emptyState}>
          <AlertCircle size={32} className={s.emptyIcon} />
          <p className={s.emptyTitle}>Sin resultados</p>
          <p className={s.emptyText}>
            {search.trim() || filter !== 'all'
              ? 'No encontramos notificaciones que coincidan con tu búsqueda.'
              : 'Todo al día. No tienes notificaciones pendientes.'}
          </p>
        </div>
      )}

      {!error && !loading && displayNotifications.length > 0 && (
        <div className={s.feed}>
          {groupedNotifications.map((group) => (
            <div key={group.key} className={s.group}>
              <div className={s.groupLabel}>{group.label}</div>
              <div className={s.groupItems}>
                {group.items.map((notification) => (
                  <div key={notification.id} className={s.feedItem}>
                    <NotificationItem
                      notification={notification}
                      onClick={handleItemClick}
                      className={s.feedItemButton}
                    />
                    <div className={s.feedItemActions}>
                      <DropdownMenu
                        trigger={
                          <button type="button" className={s.moreBtn} aria-label="Acciones">
                            <MoreHorizontal size={16} />
                          </button>
                        }
                        items={getItemActions(notification)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editingItem ? 'Editar notificación' : 'Nueva notificación'}>
        <form onSubmit={handleSubmit} className={f.form}>
          <div className={f.formSection}>
            <h3 className={f.sectionTitle}>Contenido</h3>
            <div className={f.field}>
              <label className={f.label}>Tipo</label>
              <select className={f.select} value={formTipo} onChange={(e) => setFormTipo(e.target.value as Notification['tipo'])}>
                {TIPO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={f.field}>
              <label className={f.label}>Título</label>
              <input className={f.input} value={formTitulo} onChange={(e) => setFormTitulo(e.target.value)} required />
            </div>
            <div className={f.field}>
              <label className={f.label}>Mensaje</label>
              <textarea className={f.textarea} value={formMensaje} onChange={(e) => setFormMensaje(e.target.value)} required rows={3} />
            </div>
          </div>
          <div className={f.formSection}>
            <h3 className={f.sectionTitle}>Estado</h3>
            <div className={f.field}>
              <label className={f.checkboxLabel}>
                <input type="checkbox" checked={formLeida} onChange={(e) => setFormLeida(e.target.checked)} />
                Marcada como leída
              </label>
            </div>
          </div>
          <ModalFooter
            actions={[
              { label: 'Cancelar', variant: 'secondary', type: 'button', onClick: closeModal, disabled: saving },
              { label: editingItem ? 'Guardar' : 'Crear', type: 'submit', loading: saving },
            ]}
          />
        </form>
      </Modal>

      <ConfirmationModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Eliminar notificación"
        description={`¿Eliminar la notificación "${deleteConfirm?.titulo}"?`}
      />
    </div>
  );
};
