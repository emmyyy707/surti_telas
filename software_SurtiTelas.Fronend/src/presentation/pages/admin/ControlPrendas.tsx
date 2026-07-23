import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Search, ClipboardCheck, CheckCircle, XCircle, Layers, Plus, Edit, Trash2 } from 'lucide-react';
import s from './ControlPrendas.module.css';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DataTable } from '@/shared/ui/DataTable';
import { Modal } from '@/shared/ui/Modal';
import { controlPrendaApi, type ControlPrenda } from '@/infrastructure/api/controlPrendaApi';
import { ETAPAS_CONTROL, ESTADOS_CONTROL } from '@/shared/constants/options';

type Etapa = ControlPrenda['etapa'];
type Estado = ControlPrenda['estado'];

const ETAPAS = ETAPAS_CONTROL as unknown as Etapa[];
const ESTADOS = ESTADOS_CONTROL as unknown as Estado[];

export const AdminControlPrendas: React.FC = () => {
  const [search, setSearch] = useState('');
  const [registros, setRegistros] = useState<ControlPrenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEtapa, setFiltroEtapa] = useState<'Todos' | Etapa>('Todos');
  const [filtroEstado, setFiltroEstado] = useState<'Todos' | Estado>('Todos');

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [produccionId, setProduccionId] = useState('');
  const [etapa, setEtapa] = useState<Etapa>('Control de Calidad');
  const [cantidadTotal, setCantidadTotal] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchRegistros = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await controlPrendaApi.list();
      setRegistros(data);
    } catch {
      setError('No se pudieron cargar los registros de control de prendas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRegistros();
  }, [fetchRegistros]);

  const filteredRegistros = useMemo(() => {
    const q = search.toLowerCase();
    return registros.filter(r =>
      (filtroEtapa === 'Todos' || r.etapa === filtroEtapa) &&
      (filtroEstado === 'Todos' || r.estado === filtroEstado) &&
      (r.id.toLowerCase().includes(q) ||
       (r.produccionNumero ?? '').toLowerCase().includes(q) ||
       (r.produccionCliente ?? '').toLowerCase().includes(q) ||
       r.etapa.toLowerCase().includes(q))
    );
  }, [search, filtroEtapa, filtroEstado, registros]);

  const getEtapaIcon = (etapa: string) => {
    return etapa === 'Control de Calidad' ? <ClipboardCheck size={14} /> : <Layers size={14} />;
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Proceso': return 'warning';
      case 'Aprobado': return 'success';
      case 'Rechazado': return 'danger';
      default: return 'default';
    }
  };

  const stats = {
    enProceso: registros.filter(r => r.estado === 'Proceso').length,
    aprobados: registros.filter(r => r.estado === 'Aprobado').length,
    rechazados: registros.filter(r => r.estado === 'Rechazado').length,
    total: registros.length,
  };

  const handleReview = async (r: ControlPrenda, estado: 'Aprobado' | 'Rechazado') => {
    try {
      const actualizado = await controlPrendaApi.review(
        r.id,
        estado,
        estado === 'Aprobado' ? r.cantidadTotal : 0,
        estado === 'Rechazado' ? r.cantidadTotal : 0,
      );
      setRegistros(prev => prev.map(reg => reg.id === r.id ? actualizado : reg));
      toast.success(estado === 'Aprobado' ? 'Control aprobado' : 'Control rechazado');
    } catch {
      toast.error('No fue posible actualizar el control');
    }
  };

  const handleEdit = (r: ControlPrenda) => {
    setEditingId(r.id);
    setProduccionId(r.produccionId);
    setEtapa(r.etapa);
    setCantidadTotal(String(r.cantidadTotal));
    setObservaciones(r.observaciones ?? '');
    setModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    try {
      const actualizado = await controlPrendaApi.update(editingId, {
        etapa,
        cantidadTotal: Number(cantidadTotal),
        observaciones: observaciones.trim() || undefined,
      });
      setRegistros(prev => prev.map(reg => reg.id === editingId ? actualizado : reg));
      toast.success('Control actualizado');
      setModalOpen(false);
      setEditingId(null);
    } catch {
      toast.error('No se pudo actualizar el control');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setSaving(true);
      await controlPrendaApi.remove(deleteId);
      setRegistros(prev => prev.filter(reg => reg.id !== deleteId));
      toast.success('Control eliminado');
      setDeleteId(null);
    } catch {
      toast.error('No se pudo eliminar el control');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const creado = await controlPrendaApi.create({
        produccionId: produccionId.trim(),
        etapa,
        cantidadTotal: Number(cantidadTotal),
        observaciones: observaciones.trim() || undefined,
      });
      setRegistros(prev => [creado, ...prev]);
      setModalOpen(false);
      setProduccionId('');
      setEtapa('Control de Calidad');
      setCantidadTotal('');
      setObservaciones('');
      toast.success('Control de prenda creado');
    } catch {
      toast.error('No se pudo crear el control');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Control de Prendas</h1>
          <p className={s.pageSubtitle}>Control de calidad de producción</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Nuevo control
        </Button>
        <div className={s.metricsRow}>
          <div className={`${s.metricCard} ${s.metricCardWarning}`}>
            <span className={`${s.metricIcon} ${s.metricIconPending}`}>
              <Layers size={22} />
            </span>
            <div className={s.metricBody}>
              <span className={s.metricValue}>{stats.enProceso}</span>
              <span className={s.metricLabel}>En Proceso</span>
            </div>
          </div>
          <div className={`${s.metricCard} ${s.metricCardSuccess}`}>
            <span className={`${s.metricIcon} ${s.metricIconDone}`}>
              <CheckCircle size={22} />
            </span>
            <div className={s.metricBody}>
              <span className={s.metricValue}>{stats.aprobados}</span>
              <span className={s.metricLabel}>Aprobados</span>
            </div>
          </div>
          <div className={`${s.metricCard} ${s.metricCardPrimary}`}>
            <span className={`${s.metricIcon} ${s.metricIconWarning}`}>
              <XCircle size={22} />
            </span>
            <div className={s.metricBody}>
              <span className={s.metricValue}>{stats.rechazados}</span>
              <span className={s.metricLabel}>Rechazados</span>
            </div>
          </div>
          <div className={`${s.metricCard} ${s.metricCardSuccess}`}>
            <span className={`${s.metricIcon} ${s.metricIconReceived}`}>
              <ClipboardCheck size={22} />
            </span>
            <div className={s.metricBody}>
              <span className={s.metricValue}>{stats.total}</span>
              <span className={s.metricLabel}>Total</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className={s.errorBox}>
          <span>{error}</span>
          <button className={s.retryBtn} onClick={() => void fetchRegistros()}>Reintentar</button>
        </div>
      )}

      <div className={s.filters}>
        <div className={s.filterGroup}>
          {(['Todos', ...ETAPAS] as const).map(etapa => (
            <button
              key={etapa}
              className={`${s.filterBtn} ${filtroEtapa === etapa ? s.filterBtnActive : ''}`}
              onClick={() => setFiltroEtapa(etapa as typeof filtroEtapa)}
            >
              {etapa !== 'Todos' && getEtapaIcon(etapa)}
              <span className={s.filterBtnText}>{etapa}</span>
            </button>
          ))}
        </div>
        <div className={s.filterGroup}>
          {(['Todos', ...ESTADOS] as const).map(estado => (
            <button
              key={estado}
              className={`${s.filterBtn} ${filtroEstado === estado ? s.filterBtnActive : ''}`}
              onClick={() => setFiltroEstado(estado as typeof filtroEstado)}
            >
              {estado}
            </button>
          ))}
        </div>
        <div className={s.searchBox}>
          <Search size={16} className={s.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por ID, orden, cliente o etapa..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={s.searchInput}
          />
        </div>
      </div>

      <DataTable<ControlPrenda>
        data={filteredRegistros}
        pageSize={10}
        emptyMessage={loading ? 'Cargando registros...' : error ? error : 'No se encontraron registros de control de prendas'}
        enableSorting
        enableColumnFilters
        enableRowSelection
        enableExport
        exportFileName="control_prendas"
        actions={(r) => [
          ...(r.estado === 'Proceso' ? [
            { label: 'Aprobar', icon: <CheckCircle size={14} />, onClick: () => void handleReview(r, 'Aprobado') },
            { label: 'Rechazar', icon: <XCircle size={14} />, onClick: () => void handleReview(r, 'Rechazado') },
          ] : []),
          { label: 'Editar', icon: <Edit size={14} />, onClick: () => handleEdit(r) },
          { label: 'Eliminar', icon: <Trash2 size={14} />, onClick: () => setDeleteId(r.id) },
        ]}
        toolbarLeft={
          <div className={s.quickStats}>
            <div className={s.quickStatCard}>
              <span className={`${s.quickStatIcon} ${s.quickStatIconPending}`}>
                <Layers size={14} />
              </span>
              <span className={s.quickStatNumber}>{stats.enProceso}</span>
              <span className={s.quickStatLabel}>En proceso</span>
            </div>
            <div className={s.quickStatCard}>
              <span className={`${s.quickStatIcon} ${s.quickStatIconReceived}`}>
                <CheckCircle size={14} />
              </span>
              <span className={s.quickStatNumber}>{stats.aprobados}</span>
              <span className={s.quickStatLabel}>Aprobados</span>
            </div>
            <div className={`${s.quickStatCard} ${s.quickStatWarning}`}>
              <span className={`${s.quickStatIcon} ${s.quickStatIconAlert}`}>
                <XCircle size={14} />
              </span>
              <span className={s.quickStatNumber}>{stats.rechazados}</span>
              <span className={s.quickStatLabel}>Rechazados</span>
            </div>
          </div>
        }
        columns={[
          { key: 'orden', header: 'Producción', width: '200px', sortable: true, filterable: true, filterPlaceholder: 'Filtrar orden...', render: (r) => (
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-[var(--color-text-primary)]">{r.produccionNumero ?? r.produccionId}</span>
              <span className="text-xs text-[var(--color-text-secondary)]">{r.produccionCliente ?? '—'}</span>
            </div>
          )},
          { key: 'etapa', header: 'Etapa', width: '200px', sortable: true, filterable: true, filterType: 'select', filterOptions: ETAPAS.map(e => ({ value: e, label: e })), render: (r) => (
            <div className="flex items-center gap-1.5">
              {getEtapaIcon(r.etapa)}
              <span className="text-[var(--color-text-primary)]">{r.etapa}</span>
            </div>
          )},
          { key: 'cantidades', header: 'Cantidades', width: '240px', sortable: false, render: (r) => (
            <div className="flex flex-col gap-0.5">
              <span className="text-[var(--color-text-primary)]">Total: {r.cantidadTotal} · Revisadas: {r.cantidadRevisada}</span>
              <span className="text-xs text-[var(--color-text-secondary)]">Aprobadas: {r.cantidadAprobada} · Rechazadas: {r.cantidadRechazada}</span>
            </div>
          )},
          { key: 'estado', header: 'Estado', width: '120px', sortable: true, filterable: true, filterType: 'select', filterOptions: ESTADOS.map(e => ({ value: e, label: e })), render: (r) => <Badge variant={getEstadoBadge(r.estado)}>{r.estado}</Badge> },
        ]}
        detailPanel={{
          title: (r) => `Detalle de Control - ${r.id}`,
          render: (r, onClose) => (
            <div className={s.registroInfo}>
              <div className={s.infoRow}><span className={s.infoLabel}>ID:</span><span className={s.infoValue}>{r.id}</span></div>
              <div className={s.infoRow}><span className={s.infoLabel}>Producción:</span><span className={s.infoValue}>{r.produccionNumero ?? r.produccionId}</span></div>
              {r.produccionCliente && <div className={s.infoRow}><span className={s.infoLabel}>Cliente:</span><span className={s.infoValue}>{r.produccionCliente}</span></div>}
              <div className={s.infoRow}><span className={s.infoLabel}>Etapa:</span><Badge variant="primary">{r.etapa}</Badge></div>
              <div className={s.infoRow}><span className={s.infoLabel}>Estado:</span><Badge variant={getEstadoBadge(r.estado)}>{r.estado}</Badge></div>
              <div className={s.infoRow}><span className={s.infoLabel}>Cantidad total:</span><span className={s.infoValue}>{r.cantidadTotal} unidades</span></div>
              <div className={s.infoRow}><span className={s.infoLabel}>Revisadas:</span><span className={s.infoValue}>{r.cantidadRevisada}</span></div>
              <div className={s.infoRow}><span className={s.infoLabel}>Aprobadas:</span><span className={s.infoValue}>{r.cantidadAprobada}</span></div>
              <div className={s.infoRow}><span className={s.infoLabel}>Rechazadas:</span><span className={s.infoValue}>{r.cantidadRechazada}</span></div>
              {r.revisadoPor && <div className={s.infoRow}><span className={s.infoLabel}>Revisado por:</span><span className={s.infoValue}>{r.revisadoPor.nombre}</span></div>}
              <div className={s.infoRow}><span className={s.infoLabel}>Creado por:</span><span className={s.infoValue}>{r.creadoPor.nombre}</span></div>
              <div className={s.infoRow}><span className={s.infoLabel}>Creado:</span><span className={s.infoValue}>{new Date(r.createdAt).toLocaleString()}</span></div>
              <div className={s.infoRow}><span className={s.infoLabel}>Actualizado:</span><span className={s.infoValue}>{new Date(r.updatedAt).toLocaleString()}</span></div>
              {r.observaciones && <div className={s.infoRowFull}><span className={s.infoLabel}>Observaciones:</span><span className={s.infoValue}>{r.observaciones}</span></div>}
              <div className={s.formActions}>
                {r.estado === 'Proceso' && (
                  <>
                    <Button variant="primary" onClick={() => { void handleReview(r, 'Aprobado'); onClose(); }}>Aprobar</Button>
                    <Button variant="secondary" onClick={() => { void handleReview(r, 'Rechazado'); onClose(); }}>Rechazar</Button>
                  </>
                )}
                <Button variant="secondary" onClick={onClose}>Cerrar</Button>
              </div>
            </div>
          ),
        }}
      />

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingId(null); }}
        title={editingId ? 'Editar control de prenda' : 'Nuevo control de prenda'}
        description={editingId ? 'Modifica los datos del control de prenda.' : 'Registra un nuevo control de prenda para producción.'}
        size="lg"
        variant="form"
        closeOnOverlay
      >
        <form className={s.form} onSubmit={editingId ? handleUpdate : handleCreate}>
          <div className={s.formRow}>
            <div className={s.field}>
              <label className={s.label}>ID Producción</label>
              <input
                type="text"
                className={s.input}
                value={produccionId}
                onChange={e => setProduccionId(e.target.value)}
                placeholder="Ej: cmr..."
                required
                readOnly={!!editingId}
              />
            </div>
            <div className={s.field}>
              <label className={s.label}>Etapa</label>
              <select
                className={s.select}
                value={etapa}
                onChange={e => setEtapa(e.target.value as Etapa)}
              >
                {ETAPAS.filter(e => e !== 'Todos' as any).map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
          </div>
          <div className={s.formRow}>
            <div className={s.field}>
              <label className={s.label}>Cantidad total</label>
              <input
                type="number"
                className={s.input}
                value={cantidadTotal}
                onChange={e => setCantidadTotal(e.target.value)}
                placeholder="Ej: 50"
                required
                min="1"
              />
            </div>
            <div className={s.field}>
              <label className={s.label}>Observaciones</label>
              <input
                type="text"
                className={s.input}
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>
          <div className={s.formActions}>
            <Button variant="secondary" type="button" onClick={() => { setModalOpen(false); setEditingId(null); }}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{editingId ? (saving ? 'Guardando...' : 'Guardar cambios') : (saving ? 'Guardando...' : 'Crear control')}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Eliminar control"
        description="Esta acción no se puede deshacer."
        size="sm"
      >
        <div className={s.formActions}>
          <Button variant="secondary" onClick={() => setDeleteId(null)} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={saving}>
            {saving ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
