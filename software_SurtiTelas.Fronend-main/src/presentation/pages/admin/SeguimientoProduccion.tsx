import React, { useState, useEffect, useMemo } from 'react';
import { Search, Clock, Factory, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import s from './SeguimientoProduccion.module.css';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DataTable } from '@/shared/ui/DataTable';
import { Modal } from '@/shared/ui/Modal';
import { productionApi } from '@/infrastructure/api/productionApi';
import { ESTADOS_PRODUCCION, PRIORIDADES } from '@/shared/constants/options';

const getAvanceColor = (producido: number, total: number): string => {
  const pct = (producido / total) * 100;
  if (pct >= 100) return '#22c55e';
  if (pct >= 75) return '#3b82f6';
  if (pct >= 50) return '#f59e0b';
  return '#ef4444';
};

const _getEstadoBadge = (estado: string): 'default' | 'primary' | 'warning' | 'success' | 'danger' => {
  if (estado === 'Pendiente') return 'default';
  if (estado === 'Asignada') return 'primary';
  if (estado === 'En produccion') return 'warning';
  if (estado === 'Completada') return 'success';
  return 'default';
};

const _getDiasRestantes = (fecha: string): number => {
  const today = new Date();
  const target = new Date(fecha);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

interface OrdenProduccion {
  id: string;
  numeroOrden: string;
  prenda: string;
  referencia: string;
  cantidad: number;
  cantidadProducida: number;
  fechaInicio: string;
  fechaPrometida: string;
  estado: 'Pendiente' | 'Asignada' | 'En produccion' | 'Completada';
  tallerAsignado?: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  cliente: string;
  observaciones: string;
  avance: number;
}

export const AdminSeguimientoProduccion: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'Todos' | (typeof ESTADOS_PRODUCCION)[number]>('Todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState<'Todos' | (typeof PRIORIDADES)[number]>('Todos');
  const [ordenes, setOrdenes] = useState<OrdenProduccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrden, setSelectedOrden] = useState<OrdenProduccion | null>(null);
  const [nuevoAvance, setNuevoAvance] = useState('');
  const [saving, setSaving] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editReferencia, setEditReferencia] = useState('');
  const [editCantidad, setEditCantidad] = useState('');
  const [editFecha, setEditFecha] = useState('');
  const [editNotas, setEditNotas] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const orders = await productionApi.list();
        const mapped: OrdenProduccion[] = orders.map((o) => ({
          id: o.id,
          numeroOrden: o.pedidoNumero || o.referencia,
          prenda: o.pedidoItemNombre || o.referencia,
          referencia: o.referencia,
          cantidad: o.cantidad,
          cantidadProducida: Math.round((o.avance / 100) * o.cantidad),
          fechaInicio: o.fechaInicio,
          fechaPrometida: o.fechaEstimada,
          estado: o.estado === 'En produccion' ? 'En produccion' : o.estado === 'Completada' ? 'Completada' : o.estado === 'Pendiente' ? 'Pendiente' : 'Asignada',
          tallerAsignado: o.taller?.nombre,
          prioridad: (o.pedidoPrioridad === 'ALTA' ? 'Alta' : o.pedidoPrioridad === 'MEDIA' ? 'Media' : o.pedidoPrioridad === 'BAJA' ? 'Baja' : 'Media') as OrdenProduccion['prioridad'],
          cliente: o.pedidoCliente ?? '',
          observaciones: o.notasTecnicas || '',
          avance: o.avance,
        }));
        setOrdenes(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando datos');
        toast.error('Error cargando seguimiento de producción');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredOrdenes = useMemo(() => {
    return ordenes.filter(o =>
      (filtroEstado === 'Todos' || o.estado === filtroEstado) &&
      (filtroPrioridad === 'Todos' || o.prioridad === filtroPrioridad) &&
      (o.numeroOrden.toLowerCase().includes(search.toLowerCase()) ||
       o.prenda.toLowerCase().includes(search.toLowerCase()) ||
       o.referencia.toLowerCase().includes(search.toLowerCase()) ||
       o.cliente.toLowerCase().includes(search.toLowerCase()))
    );
  }, [ordenes, search, filtroEstado, filtroPrioridad]);

  const abrirModal = (orden: OrdenProduccion) => {
    setSelectedOrden(orden);
    setNuevoAvance(String(orden.cantidadProducida));
    setModalOpen(true);
  };

  const handleCambiarEstado = async (orden: OrdenProduccion, nuevoEstado: OrdenProduccion['estado']) => {
    try {
      await productionApi.update(orden.id, { estado: nuevoEstado });
      setOrdenes(prev => prev.map(o => o.id === orden.id ? { ...o, estado: nuevoEstado } : o));
      toast.success(`Estado actualizado a ${nuevoEstado}`);
    } catch {
      toast.error('No se pudo actualizar el estado');
    }
  };

  const openEditModal = (orden: OrdenProduccion) => {
    setEditingId(orden.id);
    setEditReferencia(orden.referencia);
    setEditCantidad(String(orden.cantidad));
    setEditFecha(orden.fechaPrometida);
    setEditNotas(orden.observaciones);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    try {
      const updated = await productionApi.update(editingId, {
        referencia: editReferencia,
        cantidad: Number(editCantidad),
        fechaEstimada: editFecha,
        notasTecnicas: editNotas || undefined,
      });
      setOrdenes(prev => prev.map(o => o.id === editingId ? {
        ...o,
        referencia: updated.referencia,
        cantidad: updated.cantidad,
        fechaPrometida: updated.fechaEstimada,
        observaciones: updated.notasTecnicas || '',
        cantidadProducida: Math.round((updated.avance / 100) * updated.cantidad),
        avance: updated.avance,
      } : o));
      toast.success('Orden actualizada');
      setEditModalOpen(false);
      setEditingId(null);
    } catch {
      toast.error('No se pudo actualizar la orden');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setSaving(true);
      await productionApi.remove(deleteId);
      setOrdenes(prev => prev.filter(o => o.id !== deleteId));
      toast.success('Orden eliminada');
      setDeleteId(null);
    } catch {
      toast.error('No se pudo eliminar la orden');
    } finally {
      setSaving(false);
    }
  };

  const handleActualizarAvance = async () => {
    if (!selectedOrden || !nuevoAvance) return;
    try {
      setSaving(true);
      const producidas = Number(nuevoAvance);
      const avance = Math.round((producidas / selectedOrden.cantidad) * 100);
      if (avance >= 100) {
        await productionApi.update(selectedOrden.id, { estado: 'Completada' });
      } else {
        await productionApi.update(selectedOrden.id, { avance, estado: 'En produccion' });
      }
      setOrdenes(prev => prev.map(o => {
        if (o.id !== selectedOrden.id) return o;
        if (producidas >= o.cantidad) {
          return { ...o, cantidadProducida: o.cantidad, avance: 100, estado: 'Completada' as const };
        }
        return { ...o, cantidadProducida: producidas, avance, estado: 'En produccion' as const };
      }));
      toast.success(`Avance actualizado para ${selectedOrden.numeroOrden}`);
      setModalOpen(false);
      setSelectedOrden(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error actualizando avance');
    } finally {
      setSaving(false);
    }
  };

  const handleCompletarOrden = async (orden: OrdenProduccion) => {
    try {
      await productionApi.update(orden.id, { estado: 'Completada' });
      setOrdenes(prev => prev.map(o => o.id === orden.id
        ? { ...o, cantidadProducida: o.cantidad, avance: 100, estado: 'Completada' as const }
        : o
      ));
      toast.success(`Orden ${orden.numeroOrden} marcada como entregada`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error completando orden');
    }
  };

  const stats = {
    pendientes: ordenes.filter(o => o.estado === 'Pendiente').length,
    asignadas: ordenes.filter(o => o.estado === 'Asignada').length,
    enProduccion: ordenes.filter(o => o.estado === 'En produccion').length,
    completadas: ordenes.filter(o => o.estado === 'Completada').length,
    retrasadas: ordenes.filter(o => {
      if (o.estado === 'Completada' || o.estado === 'Pendiente') return false;
      return _getDiasRestantes(o.fechaPrometida) < 0;
    }).length,
  };

  if (loading) {
    return <div className={s.header}><p>Cargando seguimiento de producción...</p></div>;
  }

  if (error) {
    return <div className={s.header}><p className="text-red-500">{error}</p></div>;
  }

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Seguimiento de Producción</h1>
          <p className={s.pageSubtitle}>Tracking de producción externa</p>
        </div>
        <div className={s.statsRow}>
          <div className={s.statCard}>
            <Clock size={20} className={s.statIcon} />
            <div>
              <div className={s.statValue}>{stats.pendientes}</div>
              <div className={s.statLabel}>Pendientes</div>
            </div>
          </div>
          <div className={s.statCard}>
            <Factory size={20} className={s.statIcon} />
            <div>
              <div className={s.statValue}>{stats.asignadas}</div>
              <div className={s.statLabel}>Asignadas</div>
            </div>
          </div>
          <div className={`${s.statCard} ${s.statCardWarning}`}>
            <TrendingUp size={20} className={s.statIconWarning} />
            <div>
              <div className={s.statValue}>{stats.enProduccion}</div>
              <div className={s.statLabel}>En Producción</div>
            </div>
          </div>
          <div className={s.statCard}>
            <div className={s.statIconDone}>✓</div>
            <div>
              <div className={s.statValue}>{stats.completadas}</div>
              <div className={s.statLabel}>Completadas</div>
            </div>
          </div>
        </div>
      </div>

      <div className={s.filters}>
        <div className={s.filterGroup}>
          {['Todos', ...ESTADOS_PRODUCCION].map(estado => (
            <button
              key={estado}
              className={`${s.filterBtn} ${filtroEstado === estado ? s.filterBtnActive : ''}`}
              onClick={() => setFiltroEstado(estado as typeof filtroEstado)}
            >
              {estado}
            </button>
          ))}
        </div>
        <div className={s.filterGroup}>
          {['Todos', ...PRIORIDADES].map(prioridad => (
            <button
              key={prioridad}
              className={`${s.filterBtn} ${filtroPrioridad === prioridad ? s.filterBtnActive : ''}`}
              onClick={() => setFiltroPrioridad(prioridad as typeof filtroPrioridad)}
            >
              {prioridad}
            </button>
          ))}
        </div>
        <div className={s.searchBox}>
          <Search size={16} className={s.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por orden, prenda, referencia o cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={s.searchInput}
          />
        </div>
      </div>

      <DataTable<OrdenProduccion>
        data={filteredOrdenes}
        pageSize={10}
        emptyMessage="Sin resultados"
        enableSorting
        enableColumnFilters
        enableRowSelection
        enableExport
        exportFileName="seguimiento_produccion"
        actions={(o) => [
          ...(o.estado === 'En produccion' ? [{ label: 'Actualizar avance', icon: <Clock size={14} />, onClick: () => abrirModal(o) }] : []),
          ...(o.estado === 'Asignada' ? [{ label: 'Iniciar producción', icon: <Factory size={14} />, onClick: () => abrirModal(o) }] : []),
          { label: 'Editar', icon: <Edit size={14} />, onClick: () => openEditModal(o) },
          { label: 'Eliminar', icon: <Trash2 size={14} />, onClick: () => setDeleteId(o.id) },
        ]}
        columns={[
          { key: 'orden', header: 'Orden', width: '180px', sortable: true, filterable: true, filterPlaceholder: 'Filtrar orden...', render: (o) => (
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-[var(--color-text-primary)]">{o.numeroOrden}</span>
              <span className="text-xs text-[var(--color-text-secondary)]">{o.referencia}</span>
            </div>
          )},
          { key: 'producto', header: 'Producto', width: '220px', sortable: true, filterable: true, filterPlaceholder: 'Filtrar producto...', render: (o) => (
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-[var(--color-text-primary)]">{o.prenda}</span>
              <span className="text-xs text-[var(--color-text-secondary)]">{o.cantidadProducida}/{o.cantidad} unds</span>
            </div>
          )},
          { key: 'clienteTaller', header: 'Cliente / Taller', width: '240px', sortable: true, filterable: true, filterPlaceholder: 'Filtrar taller...', render: (o) => (
            <div className="flex flex-col gap-0.5">
              <span className="text-[var(--color-text-primary)]">{o.cliente}</span>
              <span className="text-xs text-[var(--color-text-secondary)]">{o.tallerAsignado || '—'}</span>
            </div>
          )},
          { key: 'avance', header: 'Avance', width: '180px', sortable: true, render: (o) => {
            const porcentaje = Math.round((o.cantidadProducida / o.cantidad) * 100);
            return (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text-secondary)]">{porcentaje}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[var(--color-bg-elevated)]">
                  <div className="h-full rounded-full" style={{ width: `${porcentaje}%`, background: getAvanceColor(o.cantidadProducida, o.cantidad) }} />
                </div>
              </div>
            );
          }},
          { key: 'estado', header: 'Estado', width: '120px', sortable: true, filterable: true, filterType: 'select', filterOptions: ESTADOS_PRODUCCION.map(e => ({ value: e, label: e === 'En produccion' ? 'En producción' : e })), render: (o) => <Badge variant={_getEstadoBadge(o.estado)}>{o.estado}</Badge> },
        ]}
        detailPanel={{
          title: (o) => `Seguimiento - ${o.numeroOrden}`,
          render: (o, onClose) => (
            <div className={s.ordenInfo}>
              <div className={s.infoRow}><span className={s.infoLabel}>Orden:</span><span className={s.infoValue}>{o.numeroOrden}</span></div>
              <div className={s.infoRow}><span className={s.infoLabel}>Prenda:</span><span className={s.infoValue}>{o.prenda}</span></div>
              <div className={s.infoRow}><span className={s.infoLabel}>Referencia:</span><span className={s.infoValue}>{o.referencia}</span></div>
              <div className={s.infoRow}><span className={s.infoLabel}>Cliente:</span><span className={s.infoValue}>{o.cliente}</span></div>
              <div className={s.infoRow}><span className={s.infoLabel}>Taller:</span><span className={s.infoValue}>{o.tallerAsignado || '—'}</span></div>
              <div className={s.infoRow}><span className={s.infoLabel}>Estado:</span>
                <div className={s.selectWrapper}>
                  <select className={s.select} value={o.estado} onChange={e => handleCambiarEstado(o, e.target.value as OrdenProduccion['estado'])}>
                    {ESTADOS_PRODUCCION.map(e => (<option key={e} value={e}>{e}</option>))}
                  </select>
                </div>
              </div>
              <div className={s.infoRow}><span className={s.infoLabel}>Fecha inicio:</span><span className={s.infoValue}>{o.fechaInicio}</span></div>
              <div className={s.infoRow}><span className={s.infoLabel}>Fecha límite:</span><span className={`${s.infoValue} ${_getDiasRestantes(o.fechaPrometida) < 0 && (o.estado !== 'Completada' && o.estado !== 'Pendiente') ? s.infoValueWarning : ''}`}>{o.fechaPrometida}{_getDiasRestantes(o.fechaPrometida) < 0 && (o.estado !== 'Completada' && o.estado !== 'Pendiente') && <span className={s.retrasoBadge}> Retrasado +{Math.abs(_getDiasRestantes(o.fechaPrometida))} días</span>}</span></div>
              <div className={s.infoRow}><span className={s.infoLabel}>Observaciones:</span><span className={s.infoValue}>{o.observaciones || '—'}</span></div>
              <div className={s.avanceSection}>
                <label className={s.label}>Unidades Producidas</label>
                <div className={s.avanceInputRow}>
                  <input type="number" className={s.avanceInput} value={nuevoAvance} onChange={e => setNuevoAvance(e.target.value)} min={0} max={o.cantidad} />
                  <span className={s.avanceTotal}>/ {o.cantidad} unidades</span>
                </div>
                <div className={s.avancePreview}>
                  <div className={s.avanceBarLarge}>
                    <div className={s.avanceFillLarge} style={{ width: `${Math.min(((Number(nuevoAvance) || 0) / o.cantidad) * 100, 100)}%`, background: getAvanceColor(Number(nuevoAvance) || 0, o.cantidad) }} />
                  </div>
                  <span className={s.avancePorcentaje}>{Math.round(((Number(nuevoAvance) || 0) / o.cantidad) * 100)}%</span>
                </div>
              </div>
              <div className={s.formActions}>
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button onClick={handleActualizarAvance} disabled={saving}>{saving ? 'Guardando...' : 'Actualizar avance'}</Button>
                {Number(nuevoAvance) >= o.cantidad && <Button variant="success" onClick={() => o && handleCompletarOrden(o)}>Marcar como entregada</Button>}
              </div>
            </div>
          ),
        }}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedOrden ? `Actualizar Avance - ${selectedOrden.numeroOrden}` : 'Actualizar Avance'}
        size="md"
        variant="form"
      >
        {selectedOrden && (
          <div className={s.detailModalContent}>
            <div className={s.ordenInfo}>
              <div className={s.infoRow}><span className={s.infoLabel}>Prenda:</span><span className={s.infoValue}>{selectedOrden.prenda}</span></div>
              <div className={s.infoRow}><span className={s.infoLabel}>Cliente:</span><span className={s.infoValue}>{selectedOrden.cliente}</span></div>
              <div className={s.infoRow}><span className={s.infoLabel}>Taller:</span><span className={s.infoValue}>{selectedOrden.tallerAsignado || '—'}</span></div>
            </div>
            <div className={s.avanceSection}>
              <label className={s.label}>Unidades Producidas</label>
              <div className={s.avanceInputRow}>
                <input type="number" className={s.avanceInput} value={nuevoAvance} onChange={e => setNuevoAvance(e.target.value)} min={0} max={selectedOrden.cantidad} />
                <span className={s.avanceTotal}>/ {selectedOrden.cantidad} unidades</span>
              </div>
              <div className={s.avancePreview}>
                <div className={s.avanceBarLarge}>
                  <div className={s.avanceFillLarge} style={{ width: `${Math.min(((Number(nuevoAvance) || 0) / selectedOrden.cantidad) * 100, 100)}%`, background: getAvanceColor(Number(nuevoAvance) || 0, selectedOrden.cantidad) }} />
                </div>
                <span className={s.avancePorcentaje}>{Math.round(((Number(nuevoAvance) || 0) / selectedOrden.cantidad) * 100)}%</span>
              </div>
            </div>
            <div className={s.formActions}>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleActualizarAvance} disabled={saving}>{saving ? 'Guardando...' : 'Actualizar avance'}</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setEditingId(null); }}
        title="Editar orden de producción"
        description="Modifica los datos de la orden."
        size="lg"
        variant="form"
      >
        <form id="editOrdenForm" className={s.form} onSubmit={handleEditSubmit}>
          <div className={s.formRow}>
            <div className={s.field}>
              <label className={s.label}>Referencia</label>
              <input
                type="text"
                className={s.input}
                value={editReferencia}
                onChange={e => setEditReferencia(e.target.value)}
                required
              />
            </div>
            <div className={s.field}>
              <label className={s.label}>Cantidad</label>
              <input
                type="number"
                className={s.input}
                value={editCantidad}
                onChange={e => setEditCantidad(e.target.value)}
                required
                min="1"
              />
            </div>
          </div>
          <div className={s.formRow}>
            <div className={s.field}>
              <label className={s.label}>Fecha límite</label>
              <input
                type="date"
                className={s.input}
                value={editFecha}
                onChange={e => setEditFecha(e.target.value)}
                required
              />
            </div>
            <div className={s.field}>
              <label className={s.label}>Observaciones</label>
              <input
                type="text"
                className={s.input}
                value={editNotas}
                onChange={e => setEditNotas(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>
          <div className={s.formActions}>
            <Button variant="secondary" type="button" onClick={() => { setEditModalOpen(false); setEditingId(null); }} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Eliminar orden"
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
