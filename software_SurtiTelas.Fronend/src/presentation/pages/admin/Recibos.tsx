import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { FileText, Printer, Clock, CheckCircle, AlertTriangle, Plus, Edit, Send, DollarSign, ChevronDown, Calendar, Save, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { SearchInput } from '@/shared/ui/SearchInput';
import s from './Recibos.module.css';
import f from '@/styles/Form.module.css';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DataTable } from '../../../shared/ui/DataTable';
import { Modal } from '../../../shared/ui/Modal';
import { ConfirmationModal } from '../../../shared/ui/ConfirmationModal';
import { receiptsApi, type Receipt } from '@/infrastructure/api/receiptsApi';
import { authApi, type BackendAuthUser } from '@/infrastructure/api/authApi';

interface Recibo {
  id: string;
  numeroRecibo: string;
  cliente: string;
  nitCliente: string;
  fechaEmision: string;
  fechaVencimiento: string;
  subtotal: number;
  iva: number;
  total: number;
  estado: 'Borrador' | 'Enviado' | 'Pagado' | 'Vencido' | 'Cancelado';
  metodoPago?: 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Credito';
  vendedor: string;
  items: ItemRecibo[];
}

interface ItemRecibo {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

interface ItemForm {
  id: string;
  descripcion: string;
  cantidad: string;
  precioUnitario: string;
}

function toRecibo(dto: Receipt, clientesMap: Map<string, BackendAuthUser>): Recibo {
  const total = Number(dto.total) || 0;
  const clienteUsuario = clientesMap.get(dto.customerId);
  const clienteNombre = clienteUsuario?.nombre ?? 'Cliente';
  const clienteEmail = clienteUsuario?.email ?? dto.customerId;
  return {
    id: dto.id,
    numeroRecibo: dto.numero,
    cliente: clienteNombre,
    nitCliente: clienteEmail,
    fechaEmision: (dto.createdAt ?? new Date().toISOString()).slice(0, 10),
    fechaVencimiento: (dto.createdAt ?? new Date().toISOString()).slice(0, 10),
    subtotal: total,
    iva: Math.round(total * 0.19),
    total,
    estado: 'Borrador',
    vendedor: 'Sin asignar',
    items: [{ id: 'I1', descripcion: 'Recibo', cantidad: 1, precioUnitario: total, total }],
  };
}

const metodosPago: NonNullable<Recibo['metodoPago']>[] = ['Efectivo', 'Transferencia', 'Tarjeta', 'Credito'];

export const AdminRecibos: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'Todos' | 'Borrador' | 'Enviado' | 'Pagado' | 'Vencido' | 'Cancelado'>('Todos');
  const [recibos, setRecibos] = useState<Recibo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [cliente, setCliente] = useState('');
  const [nitCliente, setNitCliente] = useState('');
  const [vendedor, setVendedor] = useState('');
  const [fechaEmision, setFechaEmision] = useState(new Date().toISOString().slice(0, 10));
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [metodoPago, setMetodoPago] = useState<'' | NonNullable<Recibo['metodoPago']>>('');
  const [items, setItems] = useState<ItemForm[]>([
    { id: 'I1', descripcion: '', cantidad: '', precioUnitario: '' },
  ]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNumero, setEditingNumero] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<Recibo | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<{ id: string; estado: Recibo['estado'] } | null>(null);

  const hoy = new Date().toISOString().slice(0, 10);

  const loadRecibos = async () => {
    setLoading(true);
    setError(null);
    try {
      const clientesResult = await authApi.listUsers({ limit: 100, role: 'CLIENTE' });
      const clientesMap = new Map((clientesResult.data ?? []).map(c => [c.id, c]));
      const data = await receiptsApi.list();
      const recibosFiltrados = data.filter(r => clientesMap.has(r.customerId));
      setRecibos(recibosFiltrados.map(r => toRecibo(r, clientesMap)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los recibos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecibos();
  }, []);

  const filteredRecibos = useMemo(() => {
    return recibos.filter(r =>
      (filtroEstado === 'Todos' || r.estado === filtroEstado) &&
      (r.numeroRecibo.toLowerCase().includes(search.toLowerCase()) ||
        r.cliente.toLowerCase().includes(search.toLowerCase()) ||
        r.nitCliente.toLowerCase().includes(search.toLowerCase()) ||
        r.vendedor.toLowerCase().includes(search.toLowerCase()))
    );
  }, [recibos, search, filtroEstado]);

  const subtotal = items.reduce((sum, it) => sum + (Number(it.cantidad) || 0) * (Number(it.precioUnitario) || 0), 0);
  const iva = Math.round(subtotal * 0.19);
  const total = subtotal + iva;

  const resetForm = () => {
    setCliente('');
    setNitCliente('');
    setVendedor('');
    setFechaEmision(hoy);
    setFechaVencimiento('');
    setMetodoPago('');
    setItems([{ id: 'I1', descripcion: '', cantidad: '', precioUnitario: '' }]);
    setFormError(null);
  };

  const openModal = (recibo?: Recibo) => {
    if (recibo) {
      setCliente(recibo.cliente);
      setNitCliente(recibo.nitCliente);
      setVendedor(recibo.vendedor);
      setFechaEmision(recibo.fechaEmision);
      setFechaVencimiento(recibo.fechaVencimiento);
      setMetodoPago(recibo.metodoPago || '');
      setItems(recibo.items.map(it => ({ id: it.id, descripcion: it.descripcion, cantidad: String(it.cantidad), precioUnitario: String(it.precioUnitario) })));
      setEditingId(recibo.id);
      setEditingNumero(recibo.numeroRecibo);
    } else {
      resetForm();
      setEditingId(null);
      setEditingNumero('');
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSaving(false);
    setFormError(null);
    setEditingId(null);
  };

  const updateItem = (id: string, field: keyof ItemForm, value: string) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it));
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: `I${prev.length + 1}-${Date.now()}`, descripcion: '', cantidad: '', precioUnitario: '' }]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.length > 1 ? prev.filter(it => it.id !== id) : prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!cliente.trim()) { setFormError('El cliente es obligatorio'); return; }
    if (!nitCliente.trim()) { setFormError('El NIT del cliente es obligatorio'); return; }
    const itemsValidos = items.filter(it => it.descripcion.trim() && Number(it.cantidad) > 0 && Number(it.precioUnitario) > 0);
    if (itemsValidos.length === 0) { setFormError('Debes agregar al menos un artículo válido'); return; }
    setSaving(true);
    const itemsRecibo: ItemRecibo[] = itemsValidos.map((it, idx) => {
      const cantidad = Number(it.cantidad);
      const precioUnitario = Number(it.precioUnitario);
      return {
        id: it.id || `I${idx + 1}`,
        descripcion: it.descripcion.trim(),
        cantidad,
        precioUnitario,
        total: cantidad * precioUnitario,
      };
    });
    try {
      if (editingId) {
        await receiptsApi.update(editingId, {
          customerId: nitCliente.trim(),
          concepto: itemsRecibo.map(it => it.descripcion).join(', '),
          total,
        });
        setRecibos(prev => prev.map(r => r.id === editingId ? {
          ...r,
          cliente: cliente.trim(),
          nitCliente: nitCliente.trim(),
          vendedor: vendedor.trim() || 'Sin asignar',
          fechaEmision,
          fechaVencimiento: fechaVencimiento || fechaEmision,
          items: itemsRecibo,
          metodoPago: metodoPago || undefined,
        } : r));
        toast.success('Recibo actualizado correctamente');
      } else {
        const secuencia = String(recibos.length + 1).padStart(3, '0');
        const nuevo: Recibo = {
          id: `REC-${secuencia}`,
          numeroRecibo: `R${secuencia}-${new Date().getFullYear()}`,
          cliente: cliente.trim(),
          nitCliente: nitCliente.trim(),
          fechaEmision,
          fechaVencimiento: fechaVencimiento || fechaEmision,
          subtotal,
          iva,
          total,
          estado: 'Borrador',
          metodoPago: metodoPago || undefined,
          vendedor: vendedor.trim() || 'Sin asignar',
          items: itemsRecibo,
        };
        setRecibos(prev => [nuevo, ...prev]);
        toast.success(`Recibo ${nuevo.numeroRecibo} creado`);
      }
      closeModal();
    } catch {
      toast.error('No se pudo guardar el recibo');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeStatus = async () => {
    if (!statusConfirm) return;
    try {
      await receiptsApi.updateStatus(statusConfirm.id, statusConfirm.estado);
      await loadRecibos();
      toast.success(`Recibo ${statusConfirm.id} actualizado a ${statusConfirm.estado}`);
      setStatusConfirm(null);
    } catch {
      toast.error('No se pudo actualizar el estado');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await receiptsApi.remove(deleteConfirm.id);
      await loadRecibos();
      toast.success(`Recibo ${deleteConfirm.numeroRecibo} eliminado`);
      setDeleteConfirm(null);
    } catch {
      toast.error('No se pudo eliminar el recibo');
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Borrador': return 'default';
      case 'Enviado': return 'primary';
      case 'Pagado': return 'success';
      case 'Vencido': return 'warning';
      case 'Cancelado': return 'danger';
      default: return 'default';
    }
  };

  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);
  };

  const stats = {
    totalRecibos: recibos.filter(r => r.estado !== 'Cancelado').reduce((sum, r) => sum + r.total, 0),
    pendientes: recibos.filter(r => r.estado === 'Enviado').length,
    pagados: recibos.filter(r => r.estado === 'Pagado').length,
    vencidos: recibos.filter(r => r.estado === 'Vencido').length,
    pendientesMonto: recibos.filter(r => r.estado === 'Enviado' || r.estado === 'Vencido').reduce((sum, r) => sum + r.total, 0),
  };

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Recibos</h1>
          <p className={s.pageSubtitle}>Gestión de recibos</p>
        </div>
        <div className={s.headerActions}>
          <Button leftIcon={<Plus size={16} />} onClick={() => openModal()}>
            Nuevo Recibo
          </Button>
        </div>
      </div>

      <div className={s.statsRow}>
        <div className={s.statCard}>
          <DollarSign size={20} className={s.statIcon} />
          <div>
            <div className={s.statValue}>{formatCurrency(stats.totalRecibos)}</div>
            <div className={s.statLabel}>Total Recibos</div>
          </div>
        </div>
        <div className={`${s.statCard} ${s.statCardWarning}`}>
          <Clock size={20} className={s.statIconWarning} />
          <div>
            <div className={s.statValue}>{stats.pendientesMonto > 0 ? formatCurrency(stats.pendientesMonto) : '$0'}</div>
            <div className={s.statLabel}>Por Cobrar</div>
          </div>
        </div>
        <div className={s.statCard}>
          <CheckCircle size={20} className={s.statIconSuccess} />
          <div>
            <div className={s.statValue}>{stats.pagados}</div>
            <div className={s.statLabel}>Pagados</div>
          </div>
        </div>
        <div className={`${s.statCard} ${s.statCardDanger}`}>
          <AlertTriangle size={20} className={s.statIconDanger} />
          <div>
            <div className={s.statValue}>{stats.vencidos}</div>
            <div className={s.statLabel}>Vencidos</div>
          </div>
        </div>
      </div>

      <div className={s.toolbar}>
        <SearchInput
          placeholder="Buscar por recibo, cliente o NIT..."
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
            {['Todos', 'Borrador', 'Enviado', 'Pagado', 'Vencido', 'Cancelado'].map(estado => (
              <button
                key={estado}
                className={`${s.filterBtn} ${filtroEstado === estado ? s.filterBtnActive : ''}`}
                onClick={() => setFiltroEstado(estado as typeof filtroEstado)}
              >
                {estado}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={s.tableWrapper}>
        {loading && (
          <div className={s.stateBox}>
            <Loader2 size={28} className={s.spin} />
            <p>Cargando recibos...</p>
          </div>
        )}
        {error && (
          <div className={s.errorBox}>
            <AlertCircle size={28} />
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && (
          <DataTable<Recibo>
            data={filteredRecibos}
            pageSize={10}
            emptyMessage="No se encontraron recibos"
            enableSorting
            enableColumnFilters
            enableRowSelection
            enableExport
            exportFileName="recibos"
            maxVisibleColumns={5}
            columns={[
              { key: 'numeroRecibo', header: 'N° Recibo', width: '130px', sortable: true, filterable: true, filterPlaceholder: 'Filtrar recibo...', render: (r) => <span className={s.tdPrimary}>{r.numeroRecibo}</span> },
              { key: 'cliente', header: 'Cliente', sortable: true, filterable: true, render: (r) => r.cliente },
              { key: 'nitCliente', header: 'NIT', width: '120px', render: (r) => <span className={s.tdMono}>{r.nitCliente}</span> },
              { key: 'fechaEmision', header: 'Fecha', width: '110px', render: (r) => (
                <div className={s.fechaCell}><Calendar size={14} />{r.fechaEmision}</div>
              )},
              { key: 'total', header: 'Total', width: '120px', render: (r) => <span className={`${s.tdRight} ${s.tdTotal}`}>{formatCurrency(r.total)}</span> },
              { key: 'estado', header: 'Estado', width: '160px', sortable: true, filterable: true, filterType: 'select', filterOptions: [
                { value: 'Borrador', label: 'Borrador' },
                { value: 'Enviado', label: 'Enviado' },
                { value: 'Pagado', label: 'Pagado' },
                { value: 'Vencido', label: 'Vencido' },
                { value: 'Cancelado', label: 'Cancelado' },
              ], render: (r) => (
                <Badge variant={getEstadoBadge(r.estado)}>{r.estado}</Badge>
              )},
            ]}
            actions={(r) => [
              ...(r.estado === 'Borrador' || r.estado === 'Enviado' ? [{ label: 'Editar', icon: <Edit size={14} />, onClick: () => openModal(r) }] : []),
              ...(r.estado === 'Borrador' ? [{ label: 'Enviar', icon: <Send size={14} />, onClick: async () => { await receiptsApi.updateStatus(r.id, 'Enviado'); await loadRecibos(); toast.success(`Recibo ${r.numeroRecibo} enviado`); } }] : []),
              ...(r.estado === 'Enviado' ? [{ label: 'Marcar pagado', icon: <CheckCircle size={14} />, onClick: async () => { await receiptsApi.updateStatus(r.id, 'Pagado'); await loadRecibos(); toast.success(`Recibo ${r.numeroRecibo} marcado como pagado`); } }] : []),
              { label: 'Eliminar', icon: <Trash2 size={14} />, onClick: () => setDeleteConfirm(r), danger: true },
            ]}
            detailPanel={{
              title: (r) => `Recibo ${r.numeroRecibo}`,
              render: (r, onClose) => (
                <div className={s.detailModalContent}>
                  <div className={s.detailSection}>
                    <h4 className={s.detailSectionTitle}>Información de recibo</h4>
                    <div className={s.detailGrid}>
                      <div className={s.detailItem}><span className={s.detailLabel}>Cliente</span><span>{r.cliente}</span></div>
                      <div className={s.detailItem}><span className={s.detailLabel}>NIT</span><span>{r.nitCliente}</span></div>
                      <div className={s.detailItem}><span className={s.detailLabel}>Vendedor</span><span>{r.vendedor}</span></div>
                      <div className={s.detailItem}><span className={s.detailLabel}>Emisión</span><span>{r.fechaEmision}</span></div>
                      <div className={s.detailItem}><span className={s.detailLabel}>Vencimiento</span><span>{r.fechaVencimiento}</span></div>
                      {r.metodoPago && <div className={s.detailItem}><span className={s.detailLabel}>Método</span><span>{r.metodoPago}</span></div>}
                    </div>
                  </div>
                  <div className={s.detailSection}>
                    <h4 className={s.detailSectionTitle}>Detalle de artículos</h4>
                    <table className={s.detailItemsTable}>
                      <thead><tr><th>Descripción</th><th style={{ textAlign: 'center' }}>Cant.</th><th style={{ textAlign: 'right' }}>Precio Unit.</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
                      <tbody>{r.items.map(item => (<tr key={item.id}><td>{item.descripcion}</td><td style={{ textAlign: 'center' }}>{item.cantidad}</td><td style={{ textAlign: 'right' }}>{formatCurrency(item.precioUnitario)}</td><td style={{ textAlign: 'right', fontWeight: 500 }}>{formatCurrency(item.total)}</td></tr>))}</tbody>
                    </table>
                  </div>
                  <div className={s.detailSection}>
                    <h4 className={s.detailSectionTitle}>Resumen</h4>
                    <div className={s.totalsGrid}>
                      <div className={s.totalRow}><span>Subtotal:</span><span>{formatCurrency(r.subtotal)}</span></div>
                      <div className={s.totalRow}><span>IVA (19%):</span><span>{formatCurrency(r.iva)}</span></div>
                      <div className={`${s.totalRow} ${s.totalRowFinal}`}><span>Total:</span><span>{formatCurrency(r.total)}</span></div>
                    </div>
                  </div>
                   <div className={s.modalActions}>
                    <Button variant="secondary" onClick={onClose}>Cerrar</Button>
                     <Button variant="secondary" leftIcon={<Printer size={16} />} onClick={() => { window.print(); toast.info(`Imprimiendo ${r.numeroRecibo}`); }}>Imprimir</Button>
                  </div>
                </div>
              ),
            }}
          />
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Editar Recibo' : 'Crear Nuevo Recibo'}
        description={editingId ? `Modificando ${editingNumero}` : 'Registra un recibo con sus artículos y totales'}
        size="xl"
        variant="form"
      >
        <form onSubmit={handleSubmit} className={f.form}>
          {formError && <div className={f.formError}>{formError}</div>}

          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>Cliente *</label>
              <input className={f.input} value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Ej: Tienda La Esquina" />
            </div>
            <div className={f.field}>
              <label className={f.label}>NIT *</label>
              <input className={f.input} value={nitCliente} onChange={e => setNitCliente(e.target.value)} placeholder="Ej: 900123456-1" />
            </div>
          </div>

          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>Vendedor</label>
              <input className={f.input} value={vendedor} onChange={e => setVendedor(e.target.value)} placeholder="Ej: Juan Pérez" />
            </div>
            <div className={f.field}>
              <label className={f.label}>Método de pago</label>
              <select className={f.select} value={metodoPago} onChange={e => setMetodoPago(e.target.value as NonNullable<Recibo['metodoPago']>)}>
                <option value="">Sin especificar</option>
                {metodosPago.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>Fecha de emisión *</label>
              <input className={f.input} type="date" value={fechaEmision} onChange={e => setFechaEmision(e.target.value)} />
            </div>
            <div className={f.field}>
              <label className={f.label}>Fecha de vencimiento</label>
              <input className={f.input} type="date" value={fechaVencimiento} onChange={e => setFechaVencimiento(e.target.value)} />
            </div>
          </div>

          <div className={f.field}>
            <label className={f.label}>Artículos del recibo</label>
            <table className={f.itemsTable}>
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th className={f.centerCol}>Cant.</th>
                  <th className={f.rightCol}>Precio unit.</th>
                  <th className={f.rightCol}>Total</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => {
                  const tot = (Number(it.cantidad) || 0) * (Number(it.precioUnitario) || 0);
                  return (
                    <tr key={it.id}>
                      <td><input className={f.input} value={it.descripcion} onChange={e => updateItem(it.id, 'descripcion', e.target.value)} placeholder="Descripción del artículo" /></td>
                      <td className={f.centerCol}><input className={f.input} type="number" min="1" value={it.cantidad} onChange={e => updateItem(it.id, 'cantidad', e.target.value)} /></td>
                      <td className={f.rightCol}><input className={f.input} type="number" min="0" value={it.precioUnitario} onChange={e => updateItem(it.id, 'precioUnitario', e.target.value)} /></td>
                      <td className={f.rightCol} style={{ fontWeight: 600 }}>{formatCurrency(tot)}</td>
                      <td>
                        <button type="button" className={f.removeRowBtn} onClick={() => removeItem(it.id)} aria-label="Eliminar artículo" disabled={items.length === 1}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <button type="button" className={f.addRowBtn} onClick={addItem}>
              <Plus size={14} /> Agregar artículo
            </button>
          </div>

          <div className={f.totalsBox}>
            <div className={f.totalRow}><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
            <div className={f.totalRow}><span>IVA (19%):</span><span>{formatCurrency(iva)}</span></div>
            <div className={`${f.totalRow} ${s.totalRowFinal}`}><span>Total:</span><span>{formatCurrency(total)}</span></div>
          </div>

          <div className={f.formActions}>
            <Button type="button" variant="secondary" onClick={closeModal} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving} leftIcon={<Save size={16} />}>
              {editingId ? 'Guardar cambios' : 'Crear recibo'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Eliminar recibo"
        description={`¿Estás seguro de que deseas eliminar el recibo "${deleteConfirm?.numeroRecibo}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />

      <Modal open={!!statusConfirm} onClose={() => setStatusConfirm(null)} title="Cambiar estado del recibo" description="Selecciona el nuevo estado para el recibo." size="md" variant="form">
        <div className={f.form}>
          <div className={f.field}>
            <label className={f.label}>Estado</label>
            <select className={f.select} value={statusConfirm?.estado ?? ''} onChange={e => setStatusConfirm(prev => prev ? { ...prev, estado: e.target.value as Recibo['estado'] } : null)}>
              {['Borrador', 'Enviado', 'Pagado', 'Vencido', 'Cancelado'].map(es => (
                <option key={es} value={es}>{es}</option>
              ))}
            </select>
          </div>
          <div className={f.formActions}>
            <Button variant="secondary" onClick={() => setStatusConfirm(null)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleChangeStatus} disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
