import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Save, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { SearchInput } from '@/shared/ui/SearchInput';
import s from './Pedidos.module.css';
import f from '@/styles/Form.module.css';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import { DataTable } from '../../../shared/ui/DataTable';
import { Modal } from '../../../shared/ui/Modal';
import { ConfirmationModal } from '../../../shared/ui/ConfirmationModal';
import { ordersApi } from '@/infrastructure/api/ordersApi';
import { useAuthStore } from '@/core/stores/authStore';
import { authApi, type BackendAuthUser } from '@/infrastructure/api/authApi';
import { ESTADOS_PEDIDO, ORDER_STATUS_COLORS, type EstadoPedido } from '@/shared/constants/options';
import type { Pedido, PedidoItem } from '@/core/types';
import { useServerPagination } from '@/hooks/useServerPagination';
import { ModalFooter } from '@/shared/ui/ModalFooter';
import { OrderStatusSelector } from '@/shared/ui/OrderStatusSelector';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

type PedidoFormItem = {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
};

const orderStatuses = ORDER_STATUS_COLORS;

const formatoCOP = (valor: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);

export const AdminPedidos: React.FC = () => {
  const [pageData, setPageData] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<BackendAuthUser[]>([]);
  const [asesores, setAsesores] = useState<BackendAuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [showEntregados, setShowEntregados] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const [clienteId, setClienteId] = useState('');
  const [asesorId, setAsesorId] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [estado, setEstado] = useState<Pedido['estado']>(ESTADOS_PEDIDO[0]);
  const [observaciones, setObservaciones] = useState('');
  const [items, setItems] = useState<PedidoFormItem[]>([
    { id: 'I1', nombre: '', precio: 0, cantidad: 1 },
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<Pedido | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<{ id: string; estado: Pedido['estado'] } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<Pedido['estado'] | null>(null);

  const pagination = useServerPagination(10);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken(t => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const ordersQuery: Record<string, string | number | boolean | undefined | null> = {
          page: 1,
          limit: pagination.limit,
        };
        if (debouncedSearch.trim()) ordersQuery.search = debouncedSearch.trim();

        const [ordersResult, clientesResult, _profile, asesoresResult] = await Promise.all([
          ordersApi.list(ordersQuery),
          authApi.listUsers({ limit: 100, role: 'CLIENTE' }),
          authApi.me(),
          authApi.listUsers({ limit: 100, role: 'ASESOR' }),
        ]);

        if (!cancelled) {
          setClientes(clientesResult.data ?? []);
          setAsesores(asesoresResult.data ?? []);

          const ESTADO_ENTREGADO = ESTADOS_PEDIDO[4];
          const ESTADO_RECHAZADO = ESTADOS_PEDIDO[5];
          const ESTADOS_OCULTOS = new Set(showEntregados ? [] : [ESTADO_ENTREGADO, ESTADO_RECHAZADO] as [EstadoPedido, EstadoPedido]);
          const pedidos = (ordersResult.pedidos ?? []).filter((p) => !ESTADOS_OCULTOS.has(p.estado));
          setPageData(pedidos);
          pagination.setTotalRecords(ordersResult.meta.totalRecords);
          pagination.setPage(1);

          if (!asesorId && asesoresResult.data?.length) {
            const adminAsesor = asesoresResult.data.find((u) => u.role === 'ASESOR');
            setAsesorId(adminAsesor?.id ?? '');
          }
        }
      } catch {
        if (!cancelled) toast.error('No se pudieron cargar los pedidos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [asesorId, pagination, debouncedSearch, reloadToken, showEntregados]);

  const handlePageChange = useCallback((newPage: number) => {
    pagination.setPage(newPage);
  }, [pagination]);

  const subtotal = items.reduce((sum, it) => sum + it.precio * it.cantidad, 0);
  const totalItems = items.reduce((sum, it) => sum + it.cantidad, 0);

  const resetForm = () => {
    setClienteId('');
    setAsesorId('');
    setFecha(new Date().toISOString().slice(0, 10));
    setEstado(ESTADOS_PEDIDO[0]);
    setObservaciones('');
    setItems([{ id: 'I1', nombre: '', precio: 0, cantidad: 1 }]);
    setFormError(null);
  };

  const openNew = () => {
    resetForm();
    setSelectedPedido(null);
    setEditModalOpen(true);
  };

  const openEdit = (p: Pedido) => {
    setSelectedPedido(p);
    setClienteId(p.clienteId ?? '');
    setFecha(p.fecha);
    setEstado(p.estado);
    setObservaciones(p.observaciones || '');
    setItems(
      (p.itemsList ?? []).map((it, idx) => ({
        id: `I${idx + 1}-${Date.now()}`,
        nombre: it.nombre,
        precio: it.precio,
        cantidad: it.cantidad,
      }))
    );
    setFormError(null);
    setEditModalOpen(true);
  };

  const updateFormItem = (id: string, field: keyof PedidoFormItem, value: string | number) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: `I${prev.length + 1}-${Date.now()}`, nombre: '', precio: 0, cantidad: 1 },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!clienteId) {
      setFormError('Selecciona un cliente');
      return;
    }

    const itemsValidos = items.filter((it) => it.nombre.trim() && it.cantidad > 0);
    if (itemsValidos.length === 0) {
      setFormError('Debes agregar al menos un producto al pedido');
      return;
    }

    setSaving(true);
    try {
      const itemsList: PedidoItem[] = itemsValidos.map((it) => ({
        productId: undefined,
        nombre: it.nombre,
        precio: it.precio,
        cantidad: it.cantidad,
      }));

      if (selectedPedido) {
        const actualizado = await ordersApi.updateOrderFull(selectedPedido.id, {
          clienteId,
          asesorId: asesorId || undefined,
          prioridad: undefined,
          observaciones: observaciones || undefined,
          itemsList,
        });
        setPageData((prev) =>
          prev.map((p) => (p.id === selectedPedido.id ? actualizado : p))
        );
        toast.success(`Pedido ${selectedPedido.id} actualizado`);
      } else {
        const resultado = await ordersApi.create({
          clienteId,
          asesorId: asesorId || undefined,
          itemsList,
          prioridad: undefined,
          observaciones: observaciones || undefined,
        });
        await reload();
        toast.success(`Pedido ${resultado.pedido.id} creado`);
      }
      setEditModalOpen(false);
      resetForm();
    } catch {
      toast.error('No fue posible guardar el pedido.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeStatus = async () => {
    if (!statusConfirm || !selectedStatus) return;
    try {
      await ordersApi.updateStatus(statusConfirm.id, selectedStatus);
      await reload();
      toast.success(`Pedido ${statusConfirm.id} actualizado a ${selectedStatus}`);
      setStatusConfirm(null);
      setSelectedStatus(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('401') || message.includes('No autorizado') || message.includes('Unauthorized')) {
        toast.error('Tu sesión expiró o no es válida. Inicia sesión nuevamente.');
        useAuthStore.getState().logout();
      } else {
        toast.error('No se pudo actualizar el estado');
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await ordersApi.delete(deleteConfirm.id);
      await reload();
      toast.success(`Pedido ${deleteConfirm.id} eliminado`);
      setDeleteConfirm(null);
    } catch {
      toast.error('No se pudo eliminar el pedido');
    }
  };

  const detailPedido = detailId ? pageData.find(p => p.id === detailId) : null;

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Pedidos</h1>
          <p className={s.pageSubtitle}>Gestión de pedidos del sistema</p>
        </div>
        <div className={s.headerActions}>
          <Button leftIcon={<Plus size={16} />} onClick={openNew}>Nuevo Pedido</Button>
          <Button variant="secondary" onClick={reload}>Actualizar</Button>
        </div>
      </div>

      <div className={s.toolbar}>
        <SearchInput
          placeholder="Buscar pedidos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => { setSearch(value); pagination.setPage(1); }}
          debounceMs={100}
          minChars={0}
        />
        <label className={s.toggleLabel}>
          <input type="checkbox" checked={showEntregados} onChange={(e) => setShowEntregados(e.target.checked)} />
          <span>Ver entregados</span>
        </label>
      </div>

      <div className={s.tableWrapper}>
        {loading && (
          <div className={s.loadingRow}>
            <span>Cargando pedidos...</span>
          </div>
        )}
        {!loading && (
          <DataTable<Pedido>
            data={pageData}
            pageSize={pagination.limit}
            emptyMessage="Sin resultados"
            enableSorting
            enableColumnFilters
            enableRowSelection
            enableExport
            exportFileName="pedidos"
            maxVisibleColumns={5}
            serverMode
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalRecords}
            onPageChange={handlePageChange}
            columns={[
              { key: 'id', header: 'ID Pedido', width: '130px', sortable: true, filterable: true, render: (p) => <span className={s.tdMono}>{p.numero ?? p.id}</span> },
              { key: 'cliente', header: 'Cliente', sortable: true, filterable: true, render: (p) => <span className={s.tdPrimary}>{p.cliente}</span> },
              { key: 'asesor', header: 'Asesor', render: (p) => p.asesor },
              { key: 'fecha', header: 'Fecha', width: '110px', render: (p) => p.fecha },
              { key: 'total', header: 'Total', width: '120px', render: (p) => p.total },
              { key: 'estado', header: 'Estado', width: '130px', sortable: true, filterable: true, filterType: 'select', filterOptions: ESTADOS_PEDIDO.map(es => ({ value: es, label: es })), render: (p) => (
                <Badge variant={orderStatuses[p.estado]}>{p.estado}</Badge>
              )},
            ]}
            actions={(p) => [
              { label: 'Ver detalle', icon: <Eye size={14} />, onClick: () => setDetailId(p.id) },
              { label: 'Editar', icon: <Save size={14} />, onClick: () => openEdit(p) },
              { label: 'Cambiar estado', onClick: () => { setStatusConfirm({ id: p.id, estado: p.estado }); setSelectedStatus(null); } },
              { label: 'Eliminar', icon: <Trash2 size={14} />, onClick: () => setDeleteConfirm(p), danger: true },
            ]}
            detailPanel={{
              title: (p) => `Pedido ${p.numero ?? p.id}`,
              render: (p, onClose) => (
                <div className={s.detailModalContent}>
                  <div className={s.detailSection}>
                    <h4 className={s.detailSectionTitle}>Detalles del pedido</h4>
                    <div className={s.detailGrid}>
                      <div className={s.detailItem}><span className={s.detailLabel}>ID</span><span>{p.numero ?? p.id}</span></div>
                      <div className={s.detailItem}><span className={s.detailLabel}>Cliente</span><span>{p.cliente}</span></div>
                      <div className={s.detailItem}><span className={s.detailLabel}>Asesor</span><span>{p.asesor}</span></div>
                      <div className={s.detailItem}><span className={s.detailLabel}>Items</span><span>{p.items}</span></div>
                      <div className={s.detailItem}><span className={s.detailLabel}>Total</span><span>{p.total}</span></div>
                      <div className={s.detailItem}><span className={s.detailLabel}>Estado</span><span><Badge variant={orderStatuses[p.estado]}>{p.estado}</Badge></span></div>
                    </div>
                  </div>
                  <ModalFooter
                    actions={[{ label: 'Cerrar', variant: 'secondary', onClick: onClose }]} />

                </div>
              ),
            }}
          />
        )}
      </div>

      <Modal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); resetForm(); }}
        title={selectedPedido ? 'Editar Pedido' : 'Nuevo Pedido'}
        description={selectedPedido ? `Modificando ${selectedPedido.id}` : 'Completa la información del pedido'}
        size="xl"
        variant="form"
      >
        <form onSubmit={handleSubmit} className={f.form}>
          {formError && <div className={f.formError}>{formError}</div>}

          <div className={f.formSection}>
            <h3 className={f.sectionTitle}>Información general</h3>
            <div className={f.formRow}>
              <div className={f.field}>
                <label className={f.label}>Cliente *</label>
                <select className={f.select} value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                  <option value="">Selecciona un cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className={f.field}>
                <label className={f.label}>Asesor *</label>
                <select className={f.select} value={asesorId} onChange={(e) => setAsesorId(e.target.value)}>
                  <option value="">Selecciona un asesor</option>
                  {asesores.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className={f.field}>
                <label className={f.label}>Fecha *</label>
                <input className={f.input} type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
              </div>
            </div>
            <div className={f.formRow}>
              <div className={f.field}>
                <label className={f.label}>Estado *</label>
                <select className={f.select} value={estado} onChange={(e) => setEstado(e.target.value as Pedido['estado'])}>
                  {ESTADOS_PEDIDO.map(es => (
                    <option key={es} value={es}>{es}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className={f.formSection}>
            <h3 className={f.sectionTitle}>Productos del pedido</h3>
            <div className={f.field}>
              <label className={f.label}>Productos del pedido</label>
              <table className={f.itemsTable}>
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th className={f.centerCol}>Cant.</th>
                    <th className={f.rightCol}>Precio unit.</th>
                    <th className={f.rightCol}>Subtotal</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => {
                    const sub = it.precio * it.cantidad;
                    return (
                      <tr key={it.id}>
                        <td>
                          <input
                            className={f.input}
                            value={it.nombre}
                            onChange={(e) => updateFormItem(it.id, 'nombre', e.target.value)}
                            placeholder="Producto"
                          />
                        </td>
                        <td className={f.centerCol}>
                          <input
                            className={f.input}
                            type="number"
                            min="1"
                            value={it.cantidad}
                            onChange={(e) => updateFormItem(it.id, 'cantidad', Number(e.target.value))}
                          />
                        </td>
                        <td className={f.rightCol}>
                          <input
                            className={f.input}
                            type="number"
                            min="0"
                            value={it.precio}
                            onChange={(e) => updateFormItem(it.id, 'precio', Number(e.target.value))}
                          />
                        </td>
                        <td className={f.rightCol} style={{ fontWeight: 600 }}>
                          {formatoCOP(sub)}
                        </td>
                        <td>
                          <button
                            type="button"
                            className={f.removeRowBtn}
                            onClick={() => removeItem(it.id)}
                            aria-label="Eliminar producto"
                            disabled={items.length === 1}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <button type="button" className={f.addRowBtn} onClick={addItem}>
                <Plus size={14} /> Agregar producto
              </button>
            </div>
            <div className={f.totalsBox}>
              <div className={f.totalRow}><span>Total de items:</span><span>{totalItems}</span></div>
              <div className={`${f.totalRow} ${f.totalRowFinal}`}><span>Total pedido:</span><span>{formatoCOP(subtotal)}</span></div>
            </div>
          </div>

          <div className={f.formSection}>
            <h3 className={f.sectionTitle}>Observaciones</h3>
            <div className={f.field}>
              <label className={f.label}>Observaciones</label>
              <textarea
                className={f.textarea}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas del pedido..."
                rows={2}
              />
            </div>
          </div>

          <div className={f.formActions}>
            <ModalFooter
              actions={[{ label: 'Cancelar', variant: 'secondary', type: 'button', onClick: () => { setEditModalOpen(false); resetForm(); }, disabled: saving }, { label: selectedPedido ? 'Guardar cambios' : 'Crear pedido' , type: 'submit', loading: saving, leftIcon: <Save size={16} /> }]} />
          </div>
        </form>
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

      <Modal open={!!statusConfirm} onClose={() => { setStatusConfirm(null); setSelectedStatus(null); }} title="Cambiar estado del pedido" description="Actualiza el estado del pedido." size="md" variant="form">
        <div className={f.form}>
          {statusConfirm && (
            <OrderStatusSelector
              currentStatus={statusConfirm.estado}
              selectedStatus={selectedStatus ?? statusConfirm.estado}
              onSelectedStatusChange={setSelectedStatus}
            />
          )}
          <ModalFooter
            actions={[
              { label: 'Cancelar', variant: 'secondary', onClick: () => { setStatusConfirm(null); setSelectedStatus(null); }, disabled: saving },
              { label: saving ? 'Guardando...' : 'Guardar cambios', onClick: handleChangeStatus, disabled: saving || !selectedStatus || selectedStatus === statusConfirm?.estado },
            ]}
          />
        </div>
      </Modal>

      <Modal open={!!detailId} onClose={() => setDetailId(null)} title={`Pedido ${detailPedido?.numero ?? detailPedido?.id}`} description="Detalle del pedido" size="md">
        {detailPedido && (
          <div className={s.detailModalContent}>
            <div className={s.detailSection}>
              <h4 className={s.detailSectionTitle}>Detalles del pedido</h4>
              <div className={s.detailGrid}>
                <div className={s.detailItem}><span className={s.detailLabel}>ID</span><span>{detailPedido.numero ?? detailPedido.id}</span></div>
                <div className={s.detailItem}><span className={s.detailLabel}>Cliente</span><span>{detailPedido.cliente}</span></div>
                <div className={s.detailItem}><span className={s.detailLabel}>Asesor</span><span>{detailPedido.asesor}</span></div>
                <div className={s.detailItem}><span className={s.detailLabel}>Items</span><span>{detailPedido.items}</span></div>
                <div className={s.detailItem}><span className={s.detailLabel}>Total</span><span>{detailPedido.total}</span></div>
                <div className={s.detailItem}><span className={s.detailLabel}>Estado</span><span><Badge variant={orderStatuses[detailPedido.estado]}>{detailPedido.estado}</Badge></span></div>
              </div>
            </div>
            {detailPedido.comprobantePagoUrl && (
              <div className={s.detailSection}>
                <h4 className={s.detailSectionTitle}>Comprobante de pago</h4>
                <a href={detailPedido.comprobantePagoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:underline">
                  <Eye size={14} />
                  Ver comprobante
                </a>
                <div className="mt-3 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
                  <img src={detailPedido.comprobantePagoUrl} alt="Comprobante de pago" className="max-h-64 w-full object-contain" />
                </div>
              </div>
            )}
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
                      <span>{it.nombre} | Cant: {it.cantidad} | Precio: {formatoCOP(it.precio)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <ModalFooter
              actions={[{ label: 'Cerrar', variant: 'secondary', onClick: () => setDetailId(null) }]} />

          </div>
        )}
      </Modal>
    </div>
  );
};
