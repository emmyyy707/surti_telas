import React, { useState, useMemo, useEffect } from 'react';
import { RotateCcw, CheckCircle, AlertTriangle, Package, Clock, Download, FileText, Plus, ChevronDown, Save, Loader2, AlertCircle } from 'lucide-react';
import s from './StockDevuelto.module.css';
import f from '@/styles/Form.module.css';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DataTable } from '@/shared/ui/DataTable';
import { Modal } from '@/shared/ui/Modal';
import { toast } from 'sonner';
import { returnsApi, type Return } from '@/infrastructure/api/returnsApi';

interface Devolucion {
  id: string;
  numeroDevolucion: string;
  numeroOrden: string;
  prenda: string;
  referencia: string;
  motivo: string;
  cantidad: number;
  cantidadInspeccionada: number;
  fechaDevolucion: string;
  estado: 'Recibido' | 'En inspección' | 'Aprobado' | 'Rechazado' | 'En reparación' | 'Reingresado' | 'Descartado';
  destino: 'Reingreso a inventario' | 'Reparación' | 'Descarte' | 'Devolución a proveedor';
  cliente: string;
  responsable?: string;
  observaciones: string;
}

/** El backend usa enums en mayúsculas (INGLÉS). Mapeamos a la UI en español. */
const ESTADO_TO_UI: Record<string, Devolucion['estado']> = {
  RECIBIDO: 'Recibido',
  EN_INSPECCION: 'En inspección',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  EN_REPARACION: 'En reparación',
  REINGRESADO: 'Reingresado',
  DESCARTADO: 'Descartado',
};
const ESTADO_TO_API: Record<Devolucion['estado'], string> = {
  Recibido: 'RECIBIDO',
  'En inspección': 'EN_INSPECCION',
  Aprobado: 'APROBADO',
  Rechazado: 'RECHAZADO',
  'En reparación': 'EN_REPARACION',
  Reingresado: 'REINGRESADO',
  Descartado: 'DESCARTADO',
};
const DESTINO_TO_UI: Record<string, Devolucion['destino']> = {
  REINGRESO_INVENTARIO: 'Reingreso a inventario',
  REPARACION: 'Reparación',
  DESCARTE: 'Descarte',
  DEVOLUCION_PROVEEDOR: 'Devolución a proveedor',
};
const DESTINO_TO_API: Record<Devolucion['destino'], string> = {
  'Reingreso a inventario': 'REINGRESO_INVENTARIO',
  Reparación: 'REPARACION',
  Descarte: 'DESCARTE',
  'Devolución a proveedor': 'DEVOLUCION_PROVEEDOR',
};

function toDevolucion(r: Return): Devolucion {
  return {
    id: r.id,
    numeroDevolucion: r.numeroDevolucion,
    numeroOrden: r.numeroOrden,
    prenda: r.prenda,
    referencia: r.referencia,
    motivo: r.motivo,
    cantidad: r.cantidad,
    cantidadInspeccionada: r.cantidadInspeccionada,
    fechaDevolucion: r.fechaDevolucion,
    estado: ESTADO_TO_UI[r.estado] ?? 'Recibido',
    destino: DESTINO_TO_UI[r.destino] ?? 'Reingreso a inventario',
    cliente: r.cliente,
    responsable: r.responsable,
    observaciones: r.observaciones,
  };
}

function fromDevolucion(d: Devolucion): Return {
  return {
    id: d.id,
    numeroDevolucion: d.numeroDevolucion,
    numeroOrden: d.numeroOrden,
    prenda: d.prenda,
    referencia: d.referencia,
    motivo: d.motivo,
    cantidad: d.cantidad,
    cantidadInspeccionada: d.cantidadInspeccionada,
    fechaDevolucion: d.fechaDevolucion,
    estado: (ESTADO_TO_API[d.estado] ?? 'RECIBIDO') as Return['estado'],
    destino: (DESTINO_TO_API[d.destino] ?? 'REINGRESO_INVENTARIO') as Return['destino'],
    cliente: d.cliente,
    responsable: d.responsable,
    observaciones: d.observaciones,
  };
}

export const AdminStockDevuelto: React.FC = () => {
  const [search, setSearch] = useState('');
  const [devoluciones, setDevoluciones] = useState<Devolucion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await returnsApi.list();
        if (!active) return;
        setDevoluciones(data.map(toDevolucion));
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las devoluciones');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const [numeroOrden, setNumeroOrden] = useState('');
  const [prenda, setPrenda] = useState('');
  const [referencia, setReferencia] = useState('');
  const [cliente, setCliente] = useState('');
  const [motivo, setMotivo] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [cantidadInspeccionada, setCantidadInspeccionada] = useState('0');
  const [destino, setDestino] = useState<Devolucion['destino']>('Reingreso a inventario');
  const [fechaDevolucion, setFechaDevolucion] = useState(new Date().toISOString().slice(0, 10));
  const [responsable, setResponsable] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'Todos' | 'Recibido' | 'En inspección' | 'Aprobado' | 'Rechazado' | 'En reparación' | 'Reingresado' | 'Descartado'>('Todos');
  const [filtroDestino, setFiltroDestino] = useState<'Todos' | 'Reingreso a inventario' | 'Reparación' | 'Descarte' | 'Devolución a proveedor'>('Todos');
  const [showFilters, setShowFilters] = useState(false);

  const filteredDevoluciones = useMemo(() => {
    return devoluciones.filter(d =>
      (filtroEstado === 'Todos' || d.estado === filtroEstado) &&
      (filtroDestino === 'Todos' || d.destino === filtroDestino) &&
      (d.numeroDevolucion.toLowerCase().includes(search.toLowerCase()) ||
       d.numeroOrden.toLowerCase().includes(search.toLowerCase()) ||
       d.prenda.toLowerCase().includes(search.toLowerCase()) ||
       d.referencia.toLowerCase().includes(search.toLowerCase()) ||
       d.cliente.toLowerCase().includes(search.toLowerCase()) ||
       d.motivo.toLowerCase().includes(search.toLowerCase()))
    );
  }, [devoluciones, search, filtroEstado, filtroDestino]);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Recibido': return 'default';
      case 'En inspección': return 'warning';
      case 'Aprobado': return 'primary';
      case 'Rechazado': return 'danger';
      case 'En reparación': return 'info';
      case 'Reingresado': return 'success';
      case 'Descartado': return 'danger';
      default: return 'default';
    }
  };

  const getDestinoIcon = (destino: string) => {
    switch (destino) {
      case 'Reingreso a inventario': return <RotateCcw size={14} />;
      case 'Reparación': return <Package size={14} />;
      case 'Descarte': return <AlertTriangle size={14} />;
      case 'Devolución a proveedor': return <Package size={14} />;
      default: return <Package size={14} />;
    }
  };

  const handleExport = () => {
    toast.success('Exportación iniciada', { description: 'Tu archivo se descargará en breve.' });
  };

  const resetForm = () => {
    setNumeroOrden('');
    setPrenda('');
    setReferencia('');
    setCliente('');
    setMotivo('');
    setCantidad('');
    setCantidadInspeccionada('0');
    setDestino('Reingreso a inventario');
    setFechaDevolucion(new Date().toISOString().slice(0, 10));
    setResponsable('');
    setObservaciones('');
    setFormError(null);
  };

  const openModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSaving(false);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!numeroOrden.trim()) { setFormError('El número de orden es obligatorio'); return; }
    if (!prenda.trim()) { setFormError('La prenda es obligatoria'); return; }
    if (!cliente.trim()) { setFormError('El cliente es obligatorio'); return; }
    if (!cantidad || Number(cantidad) <= 0) { setFormError('La cantidad debe ser mayor a 0'); return; }
    setSaving(true);
    const anio = new Date().getFullYear();
    const secuencia = String(devoluciones.length + 1).padStart(3, '0');
    const nueva: Devolucion = {
      id: `DEV-${secuencia}`,
      numeroDevolucion: `DEV-${anio}-${secuencia}`,
      numeroOrden: numeroOrden.trim(),
      prenda: prenda.trim(),
      referencia: referencia.trim(),
      motivo: motivo.trim(),
      cantidad: Number(cantidad),
      cantidadInspeccionada: Number(cantidadInspeccionada) || 0,
      fechaDevolucion,
      estado: 'Recibido',
      destino,
      cliente: cliente.trim(),
      responsable: responsable.trim() || undefined,
      observaciones: observaciones.trim(),
    };
    try {
      const apiInput = fromDevolucion(nueva);
      const creada = await returnsApi.create({
        numeroOrden: apiInput.numeroOrden,
        prenda: apiInput.prenda,
        referencia: apiInput.referencia,
        motivo: apiInput.motivo,
        cantidad: apiInput.cantidad,
        cantidadInspeccionada: apiInput.cantidadInspeccionada,
        destino: apiInput.destino,
        cliente: apiInput.cliente,
        responsable: apiInput.responsable,
        observaciones: apiInput.observaciones,
        fechaDevolucion: apiInput.fechaDevolucion,
      });
      setDevoluciones(prev => [{ ...nueva, id: creada.id, numeroDevolucion: creada.numeroDevolucion }, ...prev]);
      toast.success(`Devolución ${nueva.numeroDevolucion} registrada`);
      closeModal();
    } catch {
      toast.error('No fue posible registrar la devolución');
      setSaving(false);
    }
  };

  const cambiarEstado = async (d: Devolucion, estadoUI: Devolucion['estado']) => {
    const estadoApi = ESTADO_TO_API[estadoUI];
    setDevoluciones(prev => prev.map(dev => dev.id === d.id ? { ...dev, estado: estadoUI } : dev));
    try {
      await returnsApi.changeStatus(d.id, estadoApi as Return['estado']);
      toast.success(`Devolución ${d.numeroDevolucion} → ${estadoUI}`);
    } catch {
      toast.error(`No se pudo actualizar la devolución ${d.numeroDevolucion}`);
    }
  };

  const actions = (d: Devolucion) => [
    { label: 'Inspeccionar', icon: <CheckCircle size={14} />, onClick: () => cambiarEstado(d, 'En inspección'), disabled: d.estado !== 'En inspección' && d.estado !== 'Recibido' },
    { label: 'Asignar destino', icon: <Package size={14} />, onClick: () => cambiarEstado(d, 'En reparación'), disabled: !['Recibido', 'En inspección', 'Aprobado'].includes(d.estado) },
    { label: 'Completar reparación', icon: <CheckCircle size={14} />, onClick: () => cambiarEstado(d, 'Reingresado'), disabled: d.estado !== 'En reparación' },
  ];

  const stats = {
    pendientes: devoluciones.filter(d => ['Recibido', 'En inspección'].includes(d.estado)).length,
    enReparacion: devoluciones.filter(d => d.estado === 'En reparación').length,
    reingresados: devoluciones.filter(d => d.estado === 'Reingresado').length,
    descartados: devoluciones.filter(d => d.estado === 'Descartado').length,
    totalUnidades: devoluciones.reduce((sum, d) => sum + d.cantidad, 0),
  };

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Control de Stock Devuelto</h1>
          <p className={s.pageSubtitle}>Inspección y destino</p>
        </div>
        <div className={s.headerActions}>
          <Button variant="secondary" leftIcon={<Download size={16} />} onClick={handleExport}>
            Exportar
          </Button>
          <Button leftIcon={<Plus size={16} />} onClick={openModal}>
            Nueva Devolución
          </Button>
        </div>
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
          <Package size={20} className={s.statIcon} />
          <div>
            <div className={s.statValue}>{stats.enReparacion}</div>
            <div className={s.statLabel}>En Reparación</div>
          </div>
        </div>
        <div className={`${s.statCard} ${s.statCardSuccess}`}>
          <RotateCcw size={20} className={s.statIconSuccess} />
          <div>
            <div className={s.statValue}>{stats.reingresados}</div>
            <div className={s.statLabel}>Reingresados</div>
          </div>
        </div>
        <div className={`${s.statCard} ${s.statCardDanger}`}>
          <AlertTriangle size={20} className={s.statIconDanger} />
          <div>
            <div className={s.statValue}>{stats.descartados}</div>
            <div className={s.statLabel}>Descartados</div>
          </div>
        </div>
      </div>

      <div className={s.toolbar}>
        <SearchInput
          placeholder="Buscar por devolución, orden, prenda, referencia o motivo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => setSearch(value)}
          debounceMs={100}
          minChars={0}
        />
        <button className={s.filterToggle} onClick={() => setShowFilters(!showFilters)}>
          <FileText size={16} />
          Filtros
          <ChevronDown size={14} className={`${s.filterChevron} ${showFilters ? s.filterChevronOpen : ''}`} />
        </button>
      </div>

      {showFilters && (
        <div className={s.filtersPanel}>
          <div className={s.filterGroup}>
            {['Todos', 'Recibido', 'En inspección', 'Aprobado', 'Rechazado', 'En reparación', 'Reingresado', 'Descartado'].map(estado => (
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
            {['Todos', 'Reingreso a inventario', 'Reparación', 'Descarte', 'Devolución a proveedor'].map(destino => (
              <button
                key={destino}
                className={`${s.filterBtn} ${filtroDestino === destino ? s.filterBtnActive : ''}`}
                onClick={() => setFiltroDestino(destino as typeof filtroDestino)}
              >
                {getDestinoIcon(destino)}
                <span className={s.filterBtnText}>{destino}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={s.tableWrapper}>
        {loading && (
          <div className={s.stateBox}>
            <Loader2 size={28} className={s.spin} />
            <p>Cargando devoluciones...</p>
          </div>
        )}
        {error && (
          <div className={s.errorBox}>
            <AlertCircle size={28} />
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && (
        <DataTable<Devolucion>
          data={filteredDevoluciones}
          pageSize={10}
          emptyMessage="No se encontraron devoluciones"
          maxVisibleColumns={5}
          modalSize="xl"
          detailPanel={{
          title: (d) => `Devolución ${d.numeroDevolucion}`,
          render: (d) => (
            <div className={s.detailPanel}>
              <div className={s.detailSection}>
                <h4 className={s.detailSectionTitle}>Información de la devolución</h4>
                <div className={s.detailGrid}>
                  <div className={s.detailItem}><span className={s.detailLabel}>N° Orden</span><span>{d.numeroOrden}</span></div>
                  <div className={s.detailItem}><span className={s.detailLabel}>Referencia</span><span>{d.referencia}</span></div>
                  <div className={s.detailItem}><span className={s.detailLabel}>Motivo</span><span>{d.motivo}</span></div>
                  <div className={s.detailItem}><span className={s.detailLabel}>Cantidad</span><span>{d.cantidad}</span></div>
                  <div className={s.detailItem}><span className={s.detailLabel}>Cliente</span><span>{d.cliente}</span></div>
                  <div className={s.detailItem}><span className={s.detailLabel}>Fecha devolución</span><span>{d.fechaDevolucion}</span></div>
                  {d.responsable && <div className={s.detailItem}><span className={s.detailLabel}>Responsable</span><span>{d.responsable}</span></div>}
                </div>
              </div>
              {d.observaciones && (
                <div className={s.detailSection}>
                  <h4 className={s.detailSectionTitle}>Observaciones</h4>
                  <div className={s.detailItemFull}><span>{d.observaciones}</span></div>
                </div>
              )}
            </div>
          ),
        }}
        actions={actions}
        columns={[
          { key: 'numeroDevolucion', header: 'N° Devolución', width: '140px', sortable: true, render: (d) => <span className={s.tdPrimary}>{d.numeroDevolucion}</span> },
          { key: 'prenda', header: 'Prenda', sortable: true, render: (d) => d.prenda },
          { key: 'estado', header: 'Estado', width: '130px', sortable: true, filterable: true, filterType: 'select', filterOptions: [
            { value: 'Recibido', label: 'Recibido' },
            { value: 'En inspección', label: 'En inspección' },
            { value: 'Aprobado', label: 'Aprobado' },
            { value: 'Rechazado', label: 'Rechazado' },
            { value: 'En reparación', label: 'En reparación' },
            { value: 'Reingresado', label: 'Reingresado' },
            { value: 'Descartado', label: 'Descartado' },
          ], render: (d) => (
            <div className={s.estadoCell}>
              <Badge variant={getEstadoBadge(d.estado)}>{d.estado}</Badge>
            </div>
          )},
          ]}
        />
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title="Registrar Nueva Devolución"
        description="Registra una devolución de stock para su inspección"
        size="lg"
        variant="form"
      >
        <form onSubmit={handleSubmit} className={f.form}>
          {formError && <div className={f.formError}>{formError}</div>}

          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>N° Orden *</label>
              <input className={f.input} value={numeroOrden} onChange={e => setNumeroOrden(e.target.value)} placeholder="Ej: ORD-2024-010" />
            </div>
            <div className={f.field}>
              <label className={f.label}>Prenda *</label>
              <input className={f.input} value={prenda} onChange={e => setPrenda(e.target.value)} placeholder="Ej: Blusa estampada" />
            </div>
          </div>

          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>Referencia</label>
              <input className={f.input} value={referencia} onChange={e => setReferencia(e.target.value)} placeholder="Ej: REF-1008" />
            </div>
            <div className={f.field}>
              <label className={f.label}>Cliente *</label>
              <input className={f.input} value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Ej: Distribuidora del Norte" />
            </div>
          </div>

          <div className={f.field}>
            <label className={f.label}>Motivo de la devolución</label>
            <input className={f.input} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ej: Defecto de confección" />
          </div>

          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>Cantidad *</label>
              <input className={f.input} type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="0" />
            </div>
            <div className={f.field}>
              <label className={f.label}>Cantidad inspeccionada</label>
              <input className={f.input} type="number" min="0" value={cantidadInspeccionada} onChange={e => setCantidadInspeccionada(e.target.value)} placeholder="0" />
            </div>
          </div>

          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>Destino previsto *</label>
              <select className={f.select} value={destino} onChange={e => setDestino(e.target.value as Devolucion['destino'])}>
                {(['Reingreso a inventario', 'Reparación', 'Descarte', 'Devolución a proveedor'] as Devolucion['destino'][]).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className={f.field}>
              <label className={f.label}>Fecha de devolución *</label>
              <input className={f.input} type="date" value={fechaDevolucion} onChange={e => setFechaDevolucion(e.target.value)} />
            </div>
          </div>

          <div className={f.field}>
            <label className={f.label}>Responsable</label>
            <input className={f.input} value={responsable} onChange={e => setResponsable(e.target.value)} placeholder="Ej: María López" />
          </div>

          <div className={f.field}>
            <label className={f.label}>Observaciones</label>
            <textarea className={f.textarea} value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Notas sobre la devolución..." rows={3} />
          </div>

          <div className={f.formActions}>
            <Button type="button" variant="secondary" onClick={closeModal} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving} leftIcon={<Save size={16} />}>
              Registrar devolución
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


