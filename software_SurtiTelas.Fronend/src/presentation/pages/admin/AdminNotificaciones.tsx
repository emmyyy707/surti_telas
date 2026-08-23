import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import s from './AdminNotificaciones.module.css';
import f from '@/styles/Form.module.css';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DataTable, DataTableColumn } from '@/shared/ui/DataTable';
import { Modal } from '@/shared/ui/Modal';
import { notificationsApi, type Notification } from '@/infrastructure/api/notificationsApi';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { ModalFooter } from '@/shared/ui/ModalFooter';

const TIPO_OPTIONS = [
  { value: 'INFO', label: 'Info' },
  { value: 'WARNING', label: 'Advertencia' },
  { value: 'SUCCESS', label: 'Éxito' },
  { value: 'DANGER', label: 'Peligro' },
] as const;

export const AdminNotificaciones: React.FC = () => {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Notification | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Notification | null>(null);

  const [formTitulo, setFormTitulo] = useState('');
  const [formMensaje, setFormMensaje] = useState('');
  const [formTipo, setFormTipo] = useState<Notification['tipo']>('info');
  const [formLeida, setFormLeida] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await notificationsApi.list();
      setItems(result);
    } catch {
      setError('No se pudieron cargar las notificaciones');
      toast.error('No se pudieron cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const handleMarkAllRead = useCallback(async () => {
    const ok = await notificationsApi.markAllAsRead();
    if (ok) {
      toast.success('Todas las notificaciones marcadas como leídas');
      void fetchItems();
    } else {
      toast.error('No se pudieron marcar las notificaciones');
    }
  }, [fetchItems]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormTitulo('');
    setFormMensaje('');
    setFormTipo('info');
    setFormLeida(false);
    setModalOpen(true);
  };

  const openEditModal = (item: Notification) => {
    setEditingItem(item);
    setFormTitulo(item.titulo);
    setFormMensaje(item.mensaje);
    setFormTipo(item.tipo);
    setFormLeida(item.leida);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setFormTitulo('');
    setFormMensaje('');
    setFormTipo('info');
    setFormLeida(false);
  };

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
      void fetchItems();
    } catch {
      toast.error(editingItem ? 'No se pudo actualizar la notificación' : 'No se pudo crear la notificación');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleLeida = async (item: Notification) => {
    try {
      await notificationsApi.update(item.id, { leida: !item.leida });
      toast.success(item.leida ? 'Marcada como no leída' : 'Marcada como leída');
      void fetchItems();
    } catch {
      toast.error('No se pudo cambiar el estado de la notificación');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await notificationsApi.delete(deleteConfirm.id);
      toast.success('Notificación eliminada');
      void fetchItems();
    } catch {
      toast.error('No se pudo eliminar la notificación');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const getTipoBadge = (tipo: Notification['tipo']) => {
    const variants: Record<Notification['tipo'], 'default' | 'warning' | 'success' | 'danger'> = {
      info: 'default',
      warning: 'warning',
      success: 'success',
      danger: 'danger',
    };
    return <Badge variant={variants[tipo]}>{tipo.toUpperCase()}</Badge>;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
  };

  const columns: DataTableColumn<Notification>[] = [
    { key: 'tipo', header: 'Tipo', width: '100px', render: (item: Notification) => getTipoBadge(item.tipo) },
    { key: 'titulo', header: 'Título', sortable: true, render: (item: Notification) => (
      <div>
        <div style={{ fontWeight: 600 }}>{item.titulo}</div>
        <div style={{ fontSize: '0.85em', opacity: 0.7 }}>{item.mensaje.slice(0, 60)}...</div>
      </div>
    )},
    { key: 'entityType', header: 'Entidad', width: '120px', render: (item: Notification) => (
      <span>{item.entityType ?? '—'}</span>
    )},
    { key: 'leida', header: 'Estado', width: '120px', sortable: true, filterable: true, filterType: 'select', filterOptions: [
      { value: 'true', label: 'Leída' },
      { value: 'false', label: 'No leída' },
    ], render: (item: Notification) => (
      <Badge variant={item.leida ? 'default' : 'warning'}>{item.leida ? 'Leída' : 'No leída'}</Badge>
    )},
    { key: 'createdAt', header: 'Fecha', width: '150px', sortable: true, render: (item: Notification) => (
      <span>{formatDate(item.createdAt)}</span>
    )},
  ];

  const actions = (item: Notification) => [
    { label: item.leida ? 'Marcar no leída' : 'Marcar leída', icon: item.leida ? <EyeOff size={14} /> : <Eye size={14} />, onClick: () => handleToggleLeida(item) },
    { label: 'Editar', icon: <Edit size={14} />, onClick: () => openEditModal(item) },
    { label: 'Eliminar', icon: <Trash2 size={14} />, onClick: () => setDeleteConfirm(item), danger: true },
  ];

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Notificaciones</h1>
          <p className={s.pageSubtitle}>Gestiona las notificaciones del sistema</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" onClick={handleMarkAllRead}>Marcar todas como leídas</Button>
          <Button onClick={openCreateModal} leftIcon={<Plus size={16} />}>Nueva notificación</Button>
        </div>
      </div>

      <div className={s.toolbar}>
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por título o mensaje..." debounceMs={300} minChars={0} />
      </div>

      {error && !loading && (
        <div style={{ marginBottom: 16, padding: 12, border: '1px solid #fca5a5', borderRadius: 8, background: '#fef2f2', color: '#b91c1c' }}>
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={fetchItems} style={{ marginLeft: 8 }}>Reintentar</Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={items}
        emptyMessage={loading ? 'Cargando...' : 'No hay notificaciones'}
        actions={actions}
        pageSize={10}
      />

      <Modal open={modalOpen} onClose={closeModal} title={editingItem ? 'Editar notificación' : 'Nueva notificación'}>
        <form onSubmit={handleSubmit} className={f.form}>
          <div className={f.formSection}>
            <h3 className={f.sectionTitle}>Contenido</h3>
            <div className={f.field}>
              <label className={f.label}>Tipo</label>
              <select className={f.select} value={formTipo} onChange={e => setFormTipo(e.target.value as Notification['tipo'])}>
                {TIPO_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className={f.field}>
              <label className={f.label}>Título</label>
              <input className={f.input} value={formTitulo} onChange={e => setFormTitulo(e.target.value)} required />
            </div>
            <div className={f.field}>
              <label className={f.label}>Mensaje</label>
              <textarea className={f.textarea} value={formMensaje} onChange={e => setFormMensaje(e.target.value)} required rows={3} />
            </div>
          </div>
          <div className={f.formSection}>
            <h3 className={f.sectionTitle}>Estado</h3>
            <div className={f.field}>
              <label className={f.checkboxLabel}>
                <input type="checkbox" checked={formLeida} onChange={e => setFormLeida(e.target.checked)} />
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
