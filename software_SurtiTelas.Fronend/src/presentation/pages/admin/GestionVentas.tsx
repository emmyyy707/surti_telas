import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, FileText, Package, Search } from 'lucide-react';
import { toast } from 'sonner';
import s from './GestionVentas.module.css';
import f from '@/styles/Form.module.css';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Button } from '@/shared/ui/Button';
import { DataTable, DataTableColumn, DataTableAction, DataTableDetailPanel } from '@/shared/ui/DataTable';
import { Modal } from '@/shared/ui/Modal';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { ModalFooter } from '@/shared/ui/ModalFooter';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { salesApi } from '@/infrastructure/api/salesApi';
import { ordersApi } from '@/infrastructure/api/ordersApi';
import { useServerPagination } from '@/hooks/useServerPagination';
import type { Venta, Pedido } from '@/core/types';

const ESTADOS_VENTA_LABELS: Record<string, string> = {
  COMPLETADA: 'Completada',
  ANULADA: 'Anulada',
};

const MEDIOS_PAGO: { value: string; label: string }[] = [
  { value: 'CASH', label: 'Efectivo' },
  { value: 'TRANSFER', label: 'Transferencia' },
  { value: 'CARD', label: 'Tarjeta' },
  { value: 'OTHER', label: 'Otro' },
  { value: 'INSTALLMENTS', label: 'Cuotas' },
];

export const AdminGestionVentas: React.FC = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [items, setItems] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState<Venta | null>(null);
  const [saving, setSaving] = useState(false);

  const [availableOrders, setAvailableOrders] = useState<Pedido[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [createMedioPago, setCreateMedioPago] = useState('CASH');
  const [createObservaciones, setCreateObservaciones] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLFormElement>(null);
  const orderDebouncedSearch = useDebouncedValue(orderSearch, 300);
  const pagination = useServerPagination(20);

  const fetchVentas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await salesApi.list({
        search: debouncedSearch,
        page: pagination.page,
        limit: pagination.limit,
      });
      setItems(result.data);
      pagination.setTotalRecords(result.meta.totalRecords);
    } catch {
      setError('No se pudieron cargar las ventas');
      toast.error('No se pudieron cargar las ventas');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination]);

  const fetchAvailableOrders = useCallback(async () => {
    try {
      const result = await ordersApi.adminList({
        search: orderDebouncedSearch || undefined,
        limit: 100,
      });
      const ordersWithoutSale = result.pedidos.filter(
        (p) => p.estado === 'Pendiente' || (p.estado as string) === 'En validación',
      );
      setAvailableOrders(ordersWithoutSale);
    } catch {
      setAvailableOrders([]);
    }
  }, [orderDebouncedSearch]);

  useEffect(() => {
    void fetchVentas();
  }, [fetchVentas]);

  useEffect(() => {
    if (createModalOpen) {
      void fetchAvailableOrders();
    }
  }, [orderDebouncedSearch, createModalOpen, fetchAvailableOrders]);

  const getEstadoPago = (venta: Venta): string => {
    if (venta.estado === 'ANULADA') return 'Anulada';
    if (venta.payment) {
      if (venta.payment.status === 'PAGADO' || venta.payment.paidAt) return 'Pagada';
      return 'Pendiente pago';
    }
    return 'Sin pago';
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
    setSelectedVenta(null);
  };

  const handleOpenCreate = () => {
    setSelectedOrderId('');
    setCreateMedioPago('CASH');
    setCreateObservaciones('');
    setOrderSearch('');
    setErrors({});
    setCreateModalOpen(true);
    void fetchAvailableOrders();
  };

  const handleCloseCreate = () => {
    setCreateModalOpen(false);
    setSelectedOrderId('');
    setCreateMedioPago('CASH');
    setCreateObservaciones('');
    setOrderSearch('');
    setErrors({});
    setAvailableOrders([]);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!selectedOrderId) newErrors.orderId = 'Selecciona un pedido';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateVenta = async () => {
    if (!validateForm()) {
      toast.error('Corrige los errores en el formulario');
      return;
    }

    setSaving(true);
    try {
      await salesApi.create({
        orderId: selectedOrderId,
        medioPago: createMedioPago,
        observaciones: createObservaciones || undefined,
      });

      toast.success('Venta registrada correctamente');
      void fetchVentas();
      handleCloseCreate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear la venta');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelVenta = async () => {
    if (!cancelConfirm) return;
    const motivo = prompt('Ingresa el motivo de la anulación:');
    if (!motivo || motivo.trim().length < 3) {
      toast.error('El motivo de anulación es obligatorio (mínimo 3 caracteres)');
      return;
    }

    try {
      await salesApi.cancel(cancelConfirm.id, motivo);
      toast.success('Venta anulada correctamente');
      void fetchVentas();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al anular la venta');
    } finally {
      setCancelConfirm(null);
    }
  };

  const columns: DataTableColumn<Venta>[] = [
    { key: 'numero', header: 'Número', sortable: true, render: (v) => <span className="font-mono text-sm">{v.numero}</span> },
    { key: 'cliente', header: 'Cliente', sortable: true, render: (v) => v.cliente || '—' },
    { key: 'fechaVenta', header: 'Fecha', sortable: true, render: (v) => new Date(v.fechaVenta).toLocaleDateString('es-CO') },
    { key: 'itemsCount', header: 'Productos', sortable: true, render: (v) => v.itemsCount ?? v.items.length },
    { key: 'subtotal', header: 'Subtotal', sortable: true, render: (v) => `$${(v.subtotal ?? 0).toLocaleString('es-CO')}` },
    { key: 'descuentos', header: 'Descuento', sortable: true, render: (v) => `-$${(v.descuentos ?? 0).toLocaleString('es-CO')}` },
    { key: 'impuestos', header: 'Impuestos', sortable: true, render: (v) => `$${(v.impuestos ?? 0).toLocaleString('es-CO')}` },
    { key: 'total', header: 'Total', sortable: true, render: (v) => <strong className="font-semibold">$${v.total.toLocaleString('es-CO')}</strong> },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      render: (v) => {
        const label = ESTADOS_VENTA_LABELS[v.estado] ?? v.estado;
        return <span className={`badge badge-${v.estado === 'ANULADA' ? 'danger' : 'success'}`}>{label}</span>;
      },
    },
    {
      key: 'paymentState',
      header: 'Estado de pago',
      sortable: true,
      render: (v) => {
        const estadoPago = getEstadoPago(v);
        const variant = estadoPago === 'Pagada' ? 'success' : estadoPago === 'Anulada' ? 'danger' : 'warning';
        return <span className={`badge badge-${variant}`}>{estadoPago}</span>;
      },
    },
  ];

  const actions: DataTableAction<Venta>[] = [
    {
      label: 'Ver detalle',
      icon: <FileText size={14} aria-hidden="true" focusable="false" />,
      onClick: (v) => { setSelectedVenta(v); setDetailModalOpen(true); },
    },
    {
      label: 'Generar PDF',
      icon: <FileText size={14} aria-hidden="true" focusable="false" />,
      onClick: async (v) => {
        try {
          const html = await salesApi.getPdf(v.id);
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
          }
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Error al generar PDF');
        }
      },
    },
    {
      label: 'Anular',
      icon: <FileText size={14} aria-hidden="true" focusable="false" />,
      danger: true,
      onClick: (v) => {
        if (v.estado === 'ANULADA') {
          toast.error('La venta ya está anulada');
          return;
        }
        setCancelConfirm(v);
      },
    },
  ];

  const detailPanel: DataTableDetailPanel<Venta> = {
    title: (item) => `Detalle: Venta ${item.numero}`,
    size: 'lg',
    header: (item) => ({
      icon: <Package size={18} aria-hidden="true" focusable="false" />,
      title: 'Venta',
      code: item.numero,
      subtitle: item.cliente,
      meta: new Date(item.fechaVenta).toLocaleDateString('es-CO'),
      status: item.estado,
      badgeVariant: item.estado === 'ANULADA' ? 'danger' : 'success',
    }),
    kpis: (item) => [
      { label: 'Total', value: `$${item.total.toLocaleString('es-CO')}`, icon: <Package size={16} aria-hidden="true" focusable="false" />, tone: 'primary' },
      { label: 'Subtotal', value: `$${(item.subtotal ?? 0).toLocaleString('es-CO')}`, icon: <Package size={16} aria-hidden="true" focusable="false" />, tone: 'default' },
      { label: 'Impuestos', value: `$${(item.impuestos ?? 0).toLocaleString('es-CO')}`, icon: <Package size={16} aria-hidden="true" focusable="false" />, tone: 'default' },
      { label: 'Descuentos', value: `-$${(item.descuentos ?? 0).toLocaleString('es-CO')}`, icon: <Package size={16} aria-hidden="true" focusable="false" />, tone: 'default' },
      { label: 'Productos', value: String(item.itemsCount ?? item.items.length), icon: <Package size={16} aria-hidden="true" focusable="false" />, tone: 'default' },
      { label: 'Estado pago', value: getEstadoPago(item), icon: <Package size={16} aria-hidden="true" focusable="false" />, tone: 'default' },
    ],
    render: (item) => (
      <div className={s.detailPanel}>
        <div className={s.detailRow}><span>Pedido relacionado:</span> {item.orderId}</div>
        <div className={s.detailRow}><span>Estado del pedido:</span> {item.orderEstado ?? '—'}</div>
        <div className={s.detailRow}><span>Medio de pago:</span> {item.medioPago ?? '—'}</div>
        {item.receipt && <div className={s.detailRow}><span>Recibo:</span> {item.receipt.numero} ({item.receipt.estado})</div>}
        {item.customOrder && <div className={s.detailRow}><span>Cotización:</span> {item.customOrder.numero} ({item.customOrder.estado})</div>}
        {item.motivoAnulacion && <div className={s.detailRow}><span>Motivo de anulación:</span> {item.motivoAnulacion}</div>}
        <div className={s.productsSection}>
          <h3>Productos</h3>
          <div className={s.productRow} style={{ fontWeight: 600, borderBottom: '2px solid var(--color-border)' }}>
            <span>Producto</span>
            <span className={s.productCol}>Cant.</span>
            <span className={s.productCol}>Precio unit.</span>
            <span className={s.productCol}>Subtotal</span>
          </div>
          {item.items.map((prod) => (
            <div key={prod.id} className={s.productRow}>
              <span>{prod.nombre}</span>
              <span className={s.productCol}>{prod.cantidad}</span>
              <span className={s.productCol}>${prod.precio.toLocaleString('es-CO')}</span>
              <span className={s.productCol}>${(prod.precio * prod.cantidad).toLocaleString('es-CO')}</span>
            </div>
          ))}
          {item.items.length === 0 && <span className="text-sm text-[var(--color-text-secondary)]">Sin productos</span>}
        </div>
      </div>
    ),
  };

  return (
    <div>
      <div className={s.header}>
        <div>
          <h1 className={s.pageTitle}>Gestión de Ventas</h1>
          <p className={s.pageSubtitle}>Ventas registradas en el sistema</p>
        </div>
        <Button onClick={handleOpenCreate} leftIcon={<Plus size={16} />}>
          Nueva Venta
        </Button>
      </div>

      <div className={s.toolbar}>
        <SearchInput
          placeholder="Buscar ventas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => setSearch(value)}
          debounceMs={300}
          minChars={0}
        />
      </div>

      <div className={s.tableWrapper}>
        <DataTable
          data={items}
          columns={columns}
          actions={actions}
          detailPanel={detailPanel}
          enableColumnFilters={false}
          enableSorting
          toolbarLeft={null}
          maxVisibleColumns={6}
          emptyMessage={loading ? 'Cargando ventas...' : error ? error : 'No se encontraron ventas'}
          enableExport={false}
          enableRowSelection={false}
          serverMode
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalRecords}
          onPageChange={pagination.setPage}
        />
      </div>

      <Modal
        open={detailModalOpen}
        onClose={handleCloseDetail}
        title={`Detalle de Venta ${selectedVenta?.numero ?? ''}`}
        size="xl"
      >
        {selectedVenta && (
          <div className={s.detailPanel}>
            <div className={s.detailRow}><span>Número de venta:</span> {selectedVenta.numero}</div>
            <div className={s.detailRow}><span>Fecha:</span> {new Date(selectedVenta.fechaVenta).toLocaleString('es-CO')}</div>
            <div className={s.detailRow}><span>Cliente:</span> {selectedVenta.cliente}</div>
            <div className={s.detailRow}><span>Estado:</span> {ESTADOS_VENTA_LABELS[selectedVenta.estado] ?? selectedVenta.estado}</div>
            <div className={s.detailRow}><span>Estado de pago:</span> {getEstadoPago(selectedVenta)}</div>
            <div className={s.detailRow}><span>Medio de pago:</span> {selectedVenta.medioPago ?? '—'}</div>
            {selectedVenta.receipt && <div className={s.detailRow}><span>Recibo:</span> {selectedVenta.receipt.numero}</div>}
            {selectedVenta.customOrder && <div className={s.detailRow}><span>Cotización:</span> {selectedVenta.customOrder.numero}</div>}
            {selectedVenta.motivoAnulacion && <div className={s.detailRow}><span>Motivo de anulación:</span> {selectedVenta.motivoAnulacion}</div>}

            <div className={s.productsSection}>
              <h3>Productos</h3>
              <div className={s.productRow} style={{ fontWeight: 600, borderBottom: '2px solid var(--color-border)' }}>
                <span>Producto</span>
                <span className={s.productCol}>Cant.</span>
                <span className={s.productCol}>Precio unit.</span>
                <span className={s.productCol}>Subtotal</span>
              </div>
              {selectedVenta.items.map((prod) => (
                <div key={prod.id} className={s.productRow}>
                  <span>{prod.nombre}</span>
                  <span className={s.productCol}>{prod.cantidad}</span>
                  <span className={s.productCol}>${prod.precio.toLocaleString('es-CO')}</span>
                  <span className={s.productCol}>${(prod.precio * prod.cantidad).toLocaleString('es-CO')}</span>
                </div>
              ))}
              {selectedVenta.items.length === 0 && <span className="text-sm text-[var(--color-text-secondary)]">Sin productos</span>}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={createModalOpen}
        onClose={handleCloseCreate}
        title="Nueva Venta"
        size="lg"
      >
        <form className={f.form} ref={formRef} onSubmit={(e) => { e.preventDefault(); void handleCreateVenta(); }}>
          <div className={f.formSection}>
            <h3 className={f.sectionTitle}>Seleccionar pedido</h3>
            <div className={f.formRow}>
              <div className={f.field}>
                <label className={f.label}>Buscar pedido</label>
                <div style={{ position: 'relative' }}>
                  <Search
                    size={18}
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }}
                  />
                  <input
                    type="text"
                    className={f.input}
                    style={{ paddingLeft: '36px' }}
                    placeholder="Buscar por número, cliente o asesor..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={f.formRow}>
              <div className={f.field}>
                <label className={f.label}>Pedido</label>
                <select
                  className={`${f.select} ${errors.orderId ? f.inputError : ''}`}
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  disabled={availableOrders.length === 0}
                >
                  <option value="" disabled>Selecciona un pedido</option>
                  {availableOrders.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.numero ?? p.id} — {p.cliente} ({p.estado})
                    </option>
                  ))}
                </select>
                {errors.orderId && <span className={f.errorText}>{errors.orderId}</span>}
              </div>
            </div>

            <div className={f.formRow}>
              <div className={f.field}>
                <label className={f.label}>Medio de pago</label>
                <select
                  className={f.select}
                  value={createMedioPago}
                  onChange={(e) => setCreateMedioPago(e.target.value)}
                >
                  {MEDIOS_PAGO.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div className={f.field}>
                <label className={f.label}>Observaciones</label>
                <input
                  type="text"
                  className={f.input}
                  value={createObservaciones}
                  onChange={(e) => setCreateObservaciones(e.target.value)}
                  placeholder="Observaciones de la venta"
                />
              </div>
            </div>
          </div>

          <ModalFooter
            actions={[
              { label: 'Cancelar', variant: 'secondary', type: 'button', onClick: handleCloseCreate },
              {
                label: saving ? 'Guardando...' : 'Registrar venta',
                type: 'submit',
                loading: saving,
                disabled: saving,
              },
            ]}
          />
        </form>
      </Modal>

      <ConfirmationModal
        open={!!cancelConfirm}
        onClose={() => setCancelConfirm(null)}
        onConfirm={handleCancelVenta}
        title="Anular venta"
        description={`¿Estás seguro de que deseas anular la venta ${cancelConfirm?.numero ?? ''}?`}
        confirmLabel="Anular"
        variant="danger"
      />
    </div>
  );
};

export default AdminGestionVentas;
