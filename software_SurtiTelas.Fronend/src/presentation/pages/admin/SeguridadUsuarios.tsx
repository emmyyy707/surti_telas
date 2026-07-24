import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Shield, AlertTriangle, Clock, User, Globe, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import s from './SeguridadUsuarios.module.css';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DataTable, DataTableColumn, DataTableAction, DataTableDetailPanel } from '@/shared/ui/DataTable';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Modal } from '@/shared/ui/Modal';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { auditApi, type AuditLog } from '@/infrastructure/api/auditApi';
import { ESTADOS_AUDITORIA } from '@/shared/constants/options';
import f from '@/styles/Form.module.css';

type EstadoAuditoria = (typeof ESTADOS_AUDITORIA)[number];

interface Auditoria {
  id: string;
  usuario: string;
  accion: string;
  modulo: string;
  ip: string;
  fecha: string;
  hora: string;
  estado: EstadoAuditoria;
}

function deriveEstado(accion: string): EstadoAuditoria {
  const a = accion.toLowerCase();
  if (a.includes('fallid') || a.includes('error') || a.includes('denegad') || a.includes('rechaz')) return 'Fallido';
  if (a.includes('no autorizado') || a.includes('intento') || a.includes('alerta') || a.includes('sospech')) return 'Alerta';
  return 'Éxito';
}

function toAuditoria(log: AuditLog): Auditoria {
  const created = new Date(log.createdAt);
  const validDate = !Number.isNaN(created.getTime());
  return {
    id: log.id,
    usuario: log.usuario?.nombre ?? 'Sistema',
    accion: log.accion,
    modulo: log.modulo,
    ip: log.ip ?? '—',
    fecha: validDate ? created.toISOString().slice(0, 10) : '—',
    hora: validDate ? created.toTimeString().slice(0, 8) : '—',
    estado: deriveEstado(log.accion),
  };
}

export const AdminSeguridadUsuarios: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState<'Todos' | EstadoAuditoria>('Todos');
  const [auditorias, setAuditorias] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [accion, setAccion] = useState('');
  const [modulo, setModulo] = useState('auth');
  const [ip, setIp] = useState('');
  const [userAgent, setUserAgent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchAuditorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await auditApi.list();
      setAuditorias(data.map(toAuditoria));
    } catch {
      setError('No se pudieron cargar los registros de auditoría');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAuditorias();
  }, [fetchAuditorias]);

  const filteredAuditorias = useMemo(() => {
    const q = search.toLowerCase();
    return auditorias.filter(a =>
      (filtro === 'Todos' || a.estado === filtro) &&
      (a.usuario.toLowerCase().includes(q) ||
        a.accion.toLowerCase().includes(q) ||
        a.modulo.toLowerCase().includes(q))
    );
  }, [auditorias, filtro, search]);

  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await auditApi.update(editingId, {
          accion: accion.trim(),
          modulo: modulo.trim(),
          ip: ip.trim() || undefined,
          userAgent: userAgent.trim() || undefined,
        });
        toast.success('Registro actualizado');
      } else {
        await auditApi.create({
          accion: accion.trim(),
          modulo: modulo.trim(),
          ip: ip.trim() || undefined,
          userAgent: userAgent.trim() || undefined,
        });
        toast.success('Registro creado');
      }
      setModalOpen(false);
      setEditingId(null);
      setAccion('');
      setModulo('auth');
      setIp('');
      setUserAgent('');
      await fetchAuditorias();
    } catch {
      setError(editingId ? 'No se pudo actualizar el registro' : 'No se pudo crear el registro');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (auditoria: Auditoria) => {
    setEditingId(auditoria.id);
    setAccion(auditoria.accion);
    const moduloLower = auditoria.modulo.toLowerCase();
    setModulo(moduloLower.includes('auth') ? 'auth' : moduloLower.includes('users') ? 'users' : moduloLower.includes('orders') ? 'orders' : moduloLower.includes('products') ? 'products' : moduloLower.includes('customers') ? 'customers' : moduloLower.includes('stock') ? 'stock' : moduloLower.includes('production') ? 'production' : 'system');
    setIp(auditoria.ip === '—' ? '' : auditoria.ip);
    setUserAgent('');
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setSaving(true);
      await auditApi.remove(deleteId);
      toast.success('Registro eliminado');
      setDeleteId(null);
      await fetchAuditorias();
    } catch {
      setError('No se pudo eliminar el registro');
    } finally {
      setSaving(false);
    }
  };

  const columns: DataTableColumn<Auditoria>[] = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'usuario', header: 'Usuario', sortable: true, render: (a) => (
      <div className={s.usuarioCell}>
        <User size={14} />
        <span className={s.tdPrimary}>{a.usuario}</span>
      </div>
    ) },
    { key: 'accion', header: 'Acción', sortable: true },
    { key: 'modulo', header: 'Módulo', sortable: true },
    { key: 'ip', header: 'IP', sortable: true, render: (a) => (
      <div className={s.ipCell}>
        <Globe size={14} />
        {a.ip}
      </div>
    ) },
    { key: 'fecha', header: 'Fecha', sortable: true },
    { key: 'hora', header: 'Hora', sortable: true },
    { key: 'estado', header: 'Estado', sortable: true, render: (a) => (
      <Badge variant={a.estado === 'Éxito' ? 'success' : a.estado === 'Fallido' ? 'default' : 'warning'}>
        {a.estado}
      </Badge>
    ) },
  ];

  const detailPanel: DataTableDetailPanel<Auditoria> = {
    title: (a) => `Detalle de auditoría - ${a.id}`,
    size: 'lg',
    header: (a) => ({
      icon: <Shield size={18} />,
      title: 'Registro de auditoría',
      code: a.id,
      subtitle: `${a.modulo} · ${a.fecha}`,
      status: a.estado,
      badgeVariant: a.estado === 'Éxito' ? 'success' : a.estado === 'Fallido' ? 'default' : 'warning',
    }),
    kpis: (a) => [
      { label: 'Módulo', value: a.modulo, icon: <Shield size={16} />, tone: 'primary' },
      { label: 'IP', value: a.ip, icon: <Globe size={16} />, tone: 'default' },
      { label: 'Fecha', value: `${a.fecha} ${a.hora}`, icon: <Clock size={16} />, tone: 'default' },
    ],
    render: (a) => (
      <div className={s.detailPanel}>
        <div className={s.detailRow}><span>Usuario:</span> {a.usuario}</div>
        <div className={s.detailRow}><span>Acción:</span> {a.accion}</div>
        <div className={s.detailRow}><span>Módulo:</span> {a.modulo}</div>
        <div className={s.detailRow}><span>IP:</span> {a.ip}</div>
        <div className={s.detailRow}><span>Fecha:</span> {a.fecha}</div>
        <div className={s.detailRow}><span>Hora:</span> {a.hora}</div>
      </div>
    ),
  };

  const actions: DataTableAction<Auditoria>[] = [
    { label: 'Editar', icon: <Edit size={14} />, onClick: (a) => handleEdit(a) },
    { label: 'Eliminar', icon: <Trash2 size={14} />, danger: true, onClick: (a) => setDeleteId(a.id) },
  ];

  return (
    <div className={s.pageContainer}>
      <div className={s.header}>
        <div className={s.headerTop}>
          <div>
            <h1 className={s.pageTitle}>Seguridad de Usuarios</h1>
            <p className={s.pageSubtitle}>Auditoría y seguridad de usuarios</p>
          </div>
          <Button size="lg" className={s.newRecordButton} onClick={() => { setEditingId(null); setAccion(''); setModulo('auth'); setIp(''); setUserAgent(''); setModalOpen(true); }}>
            <Plus size={16} />
            Nuevo registro
          </Button>
        </div>
        <div className={s.statsRow}>
          <div className={s.statCard}>
            <Shield size={20} className={s.statIcon} />
            <div>
              <div className={s.statValue}>{auditorias.filter(a => a.estado === 'Éxito').length}</div>
              <div className={s.statLabel}>Éxitos</div>
            </div>
          </div>
          <div className={s.statCard}>
            <AlertTriangle size={20} className={s.statIcon} />
            <div>
              <div className={s.statValue}>{auditorias.filter(a => a.estado === 'Alerta').length}</div>
              <div className={s.statLabel}>Alertas</div>
            </div>
          </div>
          <div className={s.statCard}>
            <Clock size={20} className={s.statIcon} />
            <div>
              <div className={s.statValue}>{auditorias.length}</div>
              <div className={s.statLabel}>Registros</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className={s.errorBox}>
          <span>{error}</span>
          <button className={s.retryBtn} onClick={() => void fetchAuditorias()}>Reintentar</button>
        </div>
      )}

      <div className={s.filters}>
        <div className={s.filterPanel}>
          <div className={s.filterGroup}>
            {['Todos', ...ESTADOS_AUDITORIA].map(f => (
              <button
                key={f}
                className={`${s.filterBtn} ${filtro === f ? s.filterBtnActive : ''}`}
                onClick={() => setFiltro(f as typeof filtro)}
              >
                {f}
              </button>
            ))}
          </div>
          <SearchInput
            placeholder="Buscar en auditoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={(value) => setSearch(value)}
            debounceMs={100}
            minChars={0}
          />
        </div>
      </div>

      <div className={s.tableWrapper}>
        <DataTable
          data={filteredAuditorias}
          columns={columns}
          detailPanel={detailPanel}
          actions={actions}
          enableColumnFilters={false}
          enableExport={false}
          enableRowSelection={false}
          enableSorting={true}
          toolbarLeft={null}
          maxVisibleColumns={5}
          emptyMessage={loading ? 'Cargando auditoría...' : error ? error : 'No se encontraron registros de auditoría'}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingId(null); }}
        title={editingId ? 'Editar registro de auditoría' : 'Nuevo registro de auditoría'}
        description={editingId ? 'Modifica los datos del registro de auditoría.' : 'Registra manualmente una nueva entrada de auditoría para el módulo seleccionado.'}
        size="lg"
        variant="form"
      >
        <form id="auditoriaForm" className={f.form} onSubmit={handleCreateAudit}>
          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>Acción</label>
              <input
                type="text"
                className={f.input}
                value={accion}
                onChange={e => setAccion(e.target.value)}
                placeholder="Ej: Login exitoso, Cambio de estado..."
                required
              />
            </div>
            <div className={f.field}>
              <label className={f.label}>Módulo</label>
              <select className={f.select} value={modulo} onChange={e => setModulo(e.target.value)}>
                <option value="auth">Auth</option>
                <option value="users">Usuarios</option>
                <option value="orders">Pedidos</option>
                <option value="products">Productos</option>
                <option value="customers">Clientes</option>
                <option value="stock">Inventario</option>
                <option value="production">Producción</option>
                <option value="system">Sistema</option>
              </select>
            </div>
          </div>
          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>IP</label>
              <input
                type="text"
                className={f.input}
                value={ip}
                onChange={e => setIp(e.target.value)}
                placeholder="Opcional"
              />
            </div>
            <div className={f.field}>
              <label className={f.label}>User Agent</label>
              <input
                type="text"
                className={f.input}
                value={userAgent}
                onChange={e => setUserAgent(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>
          <div className={f.formActions}>
            <Button variant="secondary" type="button" onClick={() => { setModalOpen(false); setEditingId(null); }} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving} disabled={!accion.trim()}>
              {editingId ? 'Guardar cambios' : 'Crear registro'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar registro"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
};
