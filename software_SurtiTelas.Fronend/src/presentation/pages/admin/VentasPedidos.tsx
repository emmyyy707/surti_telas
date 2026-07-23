import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Eye, Trash2, Save, Loader2, AlertCircle, X } from 'lucide-react';
import s from './VentasPedidos.module.css';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { ordersApi } from '@/infrastructure/api/ordersApi';
import { authApi } from '@/infrastructure/api/authApi';
import type { Pedido, PedidoItem } from '@/core/types';
import type { BackendAuthUser } from '@/infrastructure/api/authApi';
import f from '@/styles/Form.module.css';

const ESTADOS_ORDEN = [
  'Nuevo',
  'En producción',
  'Listo',
  'Despachado',
  'En camino',
  'Entregado',
  'Cancelado',
] as const;

export const AdminVentasPedidos: React.FC = () => {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [clientes, setClientes] = useState<BackendAuthUser[]>([]);
  const [asesores, setAsesores] = useState<BackendAuthUser[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const [clienteId, setClienteId] = useState('');
  const [asesorId, setAsesorId] = useState('');
  const [estado, setEstado] = useState<Pedido['estado']>('Nuevo');
  const [prioridad, setPrioridad] = useState<Pedido['prioridad']>('Estándar');
  const [observaciones, setObservaciones] = useState('');
  const [itemsForm, setItemsForm] = useState<PedidoItem[]>([
    { nombre: '', precio: 0, cantidad: 1 },
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<Pedido | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<{ id: string; estado: Pedido['estado'] } | null>(null);

  const fetchPedidos = async () => {
    setLoading(true);
    setError(null);
    try {
      const clientesResult = await authApi.listUsers({ limit: 1000, role: 'CLIENTE' });
      const clientesIds = new Set((clientesResult.data ?? []).map(c => c.id));
      setClientes(clientesResult.data ?? []);

      const result = await ordersApi.list();
      const pedidos = (result.pedidos ?? []).filter(p => p.clienteId && clientesIds.has(p.clienteId));
      setItems(pedidos);
    } catch {
      setError('No se pudieron cargar los pedidos');
      toast.error('No se pudieron cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = useCallback(async () => {
    try {
      const [clientesResult, asesoresResult] = await Promise.all([
        authApi.listUsers({ limit: 1000, role: 'CLIENTE' }),
        authApi.listUsers({ limit: 1000, role: 'ASESOR' }),
      ]);
      setClientes(clientesResult.data ?? []);
      setAsesores(asesoresResult.data ?? []);
    } catch {
      toast.error('No se pudieron cargar clientes/asesores');
    }
  }, []);

  useEffect(() => {
    void fetchPedidos();
    void fetchOptions();
  }, [fetchOptions]);

  const filteredPedidos = useMemo(() => {
    return items.filter(p =>
      p.cliente.toLowerCase().includes(search.toLowerCase()) ||
      p.asesor.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.estado.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const resetForm = () => {
    setClienteId('');
    setAsesorId('');
    setEstado('Nuevo');
    setPrioridad('Estándar');
    setObservaciones('');
    setItemsForm([{ nombre: '', precio: 0, cantidad: 1 }]);
    setEditingId(null);
    setFormError(null);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (pedido: Pedido) => {
    const cliente = clientes.find(c => c.nombre === pedido.cliente);
    const asesor = asesores.find(a => a.nombre === pedido.asesor);
    setClienteId(cliente?.id ?? '');
    setAsesorId(asesor?.id ?? '');
    setEstado(pedido.estado);
    setPrioridad(pedido.prioridad || 'Estándar');
    setObservaciones(pedido.observaciones || '');
    setItemsForm(pedido.itemsList?.length ? pedido.itemsList : [{ nombre: '', precio: 0, cantidad: 1 }]);
    setEditingId(pedido.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSaving(false);
    setFormError(null);
    setEditingId(null);
  };

  const updateItem = (idx: number, field: keyof PedidoItem, value: string | number) => {
    setItemsForm(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const addItem = () => setItemsForm(prev => [...prev, { nombre: '', precio: 0, cantidad: 1 }]);
  const removeItem = (idx: number) => setItemsForm(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!clienteId) { setFormError('Selecciona un cliente'); return; }
    if (!asesorId) { setFormError('Selecciona un asesor'); return; }
    const validItems = itemsForm.filter(it => it.nombre.trim() && it.precio > 0 && it.cantidad > 0);
    if (validItems.length === 0) { setFormError('Agrega al menos un item válido'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await ordersApi.updateOrderFull(editingId, {
          clienteId,
          asesorId,
          prioridad,
          observaciones,
          itemsList: validItems,
        });
        await fetchPedidos();
        toast.success('Pedido actualizado');
      } else {
        await ordersApi.create({
          clienteId,
          asesorId,
          prioridad,
          observaciones,
          itemsList: validItems,
        });
        await fetchPedidos();
        toast.success('Pedido creado');
      }
      closeModal();
    } catch {
      setFormError('No se pudo guardar el pedido');
      toast.error('No se pudo guardar el pedido');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeStatus = async () => {
    if (!statusConfirm) return;
    try {
      await ordersApi.updateStatus(statusConfirm.id, statusConfirm.estado);
      await fetchPedidos();
      toast.success(`Pedido ${statusConfirm.id} actualizado a ${statusConfirm.estado}`);
      setStatusConfirm(null);
    } catch {
      toast.error('No se pudo actualizar el estado');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await ordersApi.delete(deleteConfirm.id);
      await fetchPedidos();
      toast.success(`Pedido ${deleteConfirm.id} eliminado`);
      setDeleteConfirm(null);
    } catch {
      toast.error('No se pudo eliminar el pedido');
    }
  };

  const detailPedido = detailId ? items.find(p => p.id === detailId) : null;

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Ventas y Pedidos</h1>
          <p className={s.pageSubtitle}>Resumen de ventas y pedidos</p>
        </div>
        <div className={s.headerActions}>
          <Button leftIcon={<Plus size={16} />} onClick={openCreate}>Nuevo Pedido</Button>
          <Button variant="secondary" onClick={fetchPedidos}>Actualizar</Button>
        </div>
      </div>

      <div className={s.toolbar}>
        <SearchInput
          placeholder="Buscar pedidos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => setSearch(value)}
          debounceMs={100}
          minChars={0}
        />
      </div>

      <div className={s.tableWrapper}>
        {loading && (
          <div className={s.loadingRow}>
            <Loader2 size={18} className={s.spin} />
            <span>Cargando pedidos...</span>
          </div>
        )}
        {error && !loading && (
          <div className={s.errorRow}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {!loading && !error && (
          <table className={s.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Asesor</th>
                <th>Fecha</th>
                <th>Items</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPedidos.map(pedido => (
                <tr key={pedido.id}>
                  <td className={s.tdMono}>{pedido.id}</td>
                  <td className={s.tdPrimary}>{pedido.cliente}</td>
                  <td>{pedido.asesor}</td>
                  <td>{pedido.fecha}</td>
                  <td>{pedido.items}</td>
                  <td>{pedido.total}</td>
                  <td>
                    <span className={`${s.badge} ${s[`badge_${pedido.estado.toLowerCase().replace(/\s+/g, '_')}`] || s.badge_default}`}>
                      {pedido.estado}
                    </span>
                  </td>
                  <td>
                    <div className={s.actions}>
                      <button className={s.actionBtn} title="Ver detalle" onClick={() => setDetailId(pedido.id)}>
                        <Eye size={14} />
                      </button>
                      <button className={s.actionBtn} title="Cambiar estado" onClick={() => setStatusConfirm({ id: pedido.id, estado: pedido.estado })}>
                        <span title="Cambiar estado" style={{ fontSize: 12 }}>✎</span>
                      </button>
                      <button className={s.actionBtn} title="Editar" onClick={() => openEdit(pedido)}>
                        <Save size={14} />
                      </button>
                      <button className={`${s.actionBtn} ${s.danger}`} title="Eliminar" onClick={() => setDeleteConfirm(pedido)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPedidos.length === 0 && (
                <tr>
                  <td colSpan={8} className={s.emptyRow}>Sin resultados</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editingId ? 'Editar Pedido' : 'Nuevo Pedido'} description="Completa la información del pedido" size="lg" variant="form">
        <form onSubmit={handleSubmit} className={f.form}>
          {formError && <div className={f.formError}>{formError}</div>}
          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>Cliente *</label>
              <select className={f.select} value={clienteId} onChange={e => setClienteId(e.target.value)}>
                <option value="">Selecciona un cliente</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className={f.field}>
              <label className={f.label}>Asesor *</label>
              <select className={f.select} value={asesorId} onChange={e => setAsesorId(e.target.value)}>
                <option value="">Selecciona un asesor</option>
                {asesores.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className={f.formRow}>
            <div className={f.field}>
              <label className={f.label}>Estado</label>
              <select className={f.select} value={estado} onChange={e => setEstado(e.target.value as Pedido['estado'])}>
                {ESTADOS_ORDEN.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className={f.field}>
              <label className={f.label}>Prioridad</label>
              <select className={f.select} value={prioridad} onChange={e => setPrioridad(e.target.value as Pedido['prioridad'])}>
                <option value="Estándar">Estándar</option>
                <option value="Prioritario">Prioritario</option>
              </select>
            </div>
          </div>
          <div className={f.field}>
            <label className={f.label}>Observaciones</label>
            <textarea className={f.textarea} rows={3} value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Notas del pedido..." />
          </div>
          <div className={f.field}>
            <label className={f.label}>Items del pedido</label>
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
                {itemsForm.map((it, idx) => (
                  <tr key={idx}>
                    <td><input className={f.input} value={it.nombre} onChange={e => updateItem(idx, 'nombre', e.target.value)} placeholder="Item" /></td>
                    <td className={f.centerCol}><input className={f.input} type="number" min="1" value={it.cantidad} onChange={e => updateItem(idx, 'cantidad', Number(e.target.value))} /></td>
                    <td className={f.rightCol}><input className={f.input} type="number" min="0" value={it.precio} onChange={e => updateItem(idx, 'precio', Number(e.target.value))} /></td>
                    <td className={f.rightCol} style={{ fontWeight: 600 }}>${((it.cantidad || 0) * (it.precio || 0)).toLocaleString('es-CO')}</td>
                    <td>
                      <button type="button" className={f.removeRowBtn} onClick={() => removeItem(idx)} aria-label="Eliminar item" disabled={itemsForm.length === 1}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className={f.addRowBtn} onClick={addItem}>
              <Plus size={14} /> Agregar item
            </button>
          </div>
          <div className={f.formActions}>
            <Button type="button" variant="secondary" onClick={closeModal} disabled={saving}>Cancelar</Button>
            <Button type="submit" loading={saving} leftIcon={<Save size={16} />}>{editingId ? 'Guardar cambios' : 'Crear pedido'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!detailId} onClose={() => setDetailId(null)} title={`Pedido ${detailPedido?.id}`} description="Detalle del pedido" size="md">
        {detailPedido && (
          <div className={s.detailModalContent}>
            <div className={s.detailSection}>
              <h4 className={s.detailSectionTitle}>Información general</h4>
              <div className={s.detailGrid}>
                <div className={s.detailItem}><span className={s.detailLabel}>Cliente</span><span>{detailPedido.cliente}</span></div>
                <div className={s.detailItem}><span className={s.detailLabel}>Asesor</span><span>{detailPedido.asesor}</span></div>
                <div className={s.detailItem}><span className={s.detailLabel}>Estado</span><span>{detailPedido.estado}</span></div>
                <div className={s.detailItem}><span className={s.detailLabel}>Prioridad</span><span>{detailPedido.prioridad || 'Estándar'}</span></div>
                <div className={s.detailItem}><span className={s.detailLabel}>Total</span><span>{detailPedido.total}</span></div>
                <div className={s.detailItem}><span className={s.detailLabel}>Fecha</span><span>{detailPedido.fecha}</span></div>
              </div>
            </div>
            {detailPedido.observaciones && (
              <div className={s.detailSection}>
                <h4 className={s.detailSectionTitle}>Observaciones</h4>
                <p>{detailPedido.observaciones}</p>
              </div>
            )}
            {detailPedido.itemsList && detailPedido.itemsList.length > 0 && (
              <div className={s.detailSection}>
                <h4 className={s.detailSectionTitle}>Items</h4>
                <div className={s.detailGrid}>
                  {detailPedido.itemsList.map((it, idx) => (
                    <div className={s.detailItem} key={idx}>
                      <span className={s.detailLabel}>Item {idx + 1}</span>
                      <span>{it.nombre} | Cant: {it.cantidad} | Precio: ${Math.round(it.precio).toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className={s.modalActions}>
              <Button variant="secondary" onClick={() => setDetailId(null)}>Cerrar</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Eliminar pedido"
        description={`¿Estás seguro de que deseas eliminar el pedido "${deleteConfirm?.id}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />

      <Modal open={!!statusConfirm} onClose={() => setStatusConfirm(null)} title="Cambiar estado del pedido" description="Selecciona el nuevo estado para el pedido." size="md" variant="form">
        <div className={f.form}>
          <div className={f.field}>
            <label className={f.label}>Estado</label>
            <select className={f.select} value={statusConfirm?.estado ?? ''} onChange={e => setStatusConfirm(prev => prev ? { ...prev, estado: e.target.value as Pedido['estado'] } : null)}>
              {ESTADOS_ORDEN.map(e => <option key={e} value={e}>{e}</option>)}
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
