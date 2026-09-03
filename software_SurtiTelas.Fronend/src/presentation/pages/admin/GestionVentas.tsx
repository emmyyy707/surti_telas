import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, FileText, Package, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import s from './GestionVentas.module.css';
import f from '@/styles/Form.module.css';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Button } from '@/shared/ui/Button';
import { DataTable, DataTableColumn, DataTableDetailPanel } from '@/shared/ui/DataTable';
import { Modal } from '@/shared/ui/Modal';
import { ConfirmWithReasonModal } from '@/shared/ui/ConfirmWithReasonModal';
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

const TIPO_PAGO_LABELS: Record<string, string> = {
  PAGO_INMEDIATO: 'Pago inmediato',
  ABONO_INICIAL: 'Anticipo',
  CUOTA: 'Cuota',
  PAGO_SALDO: 'Pago de saldo',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  REFUNDED: 'Reembolsado',
  ANULADO: 'Anulado',
};

const MEDIOS_PAGO: { value: string; label: string }[] = [
  { value: 'CASH', label: 'Efectivo' },
  { value: 'TRANSFER', label: 'Transferencia' },
  { value: 'CARD', label: 'Tarjeta' },
  { value: 'OTHER', label: 'Otro' },
  { value: 'INSTALLMENTS', label: 'Cuotas' },
];

const CANCELABLE_ORDER_STATES = ['NUEVO', 'PENDIENTE', 'EN_VALIDACION', 'ACEPTADO', 'EN_PRODUCCION', 'LISTO', 'DESPACHADO', 'EN_CAMINO', 'RECIBO_GENERADO', 'RECIBO_ENVIADO', 'ENTREGADO', 'RECHAZADO'] as const;

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
  const [deleteConfirm, setDeleteConfirm] = useState<Venta | null>(null);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [availableOrders, setAvailableOrders] = useState<Pedido[]>([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [createMedioPago, setCreateMedioPago] = useState('CASH');
  const [createObservaciones, setCreateObservaciones] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filtros adicionales para el listado de ventas
  const [filterOrderId, setFilterOrderId] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
  const [filterTipoPago, setFilterTipoPago] = useState('');
  const [filterMedioPago, setFilterMedioPago] = useState('');
  const [filterDesde, setFilterDesde] = useState('');
  const [filterHasta, setFilterHasta] = useState('');

  const formRef = useRef<HTMLFormElement>(null);
  const orderDebouncedSearch = useDebouncedValue(orderSearch, 300);
  const pagination = useServerPagination(20);

  const fetchVentas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await salesApi.list({
        search: debouncedSearch || undefined,
        page: pagination.page,
        limit: pagination.limit,
        orderId: filterOrderId || undefined,
        paymentStatus: filterPaymentStatus || undefined,
        tipoPago: filterTipoPago || undefined,
        medioPago: filterMedioPago || undefined,
        desde: filterDesde || undefined,
        hasta: filterHasta || undefined,
      });
      setItems(result.data);
      pagination.setTotalRecords(result.meta.totalRecords);
    } catch {
      setError('No se pudieron cargar las ventas');
      toast.error('No se pudieron cargar las ventas');
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    pagination,
    filterOrderId,
    filterPaymentStatus,
    filterTipoPago,
    filterMedioPago,
    filterDesde,
    filterHasta,
  ]);

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
    if (venta.paymentStatus === 'REFUNDED') return 'Reembolsado';
    if (venta.paymentStatus === 'ANULADO') return 'Anulado';
    if (venta.paymentStatus === 'REJECTED') return 'Rechazado';
    if (venta.payment) {
      if (venta.payment.status === 'PAGADO' || venta.payment.paidAt) return 'Pagada';
      return 'Pendiente pago';
    }
    if (venta.paymentStatus === 'APPROVED' || venta.paymentId) return 'Pagada';
    return 'Sin pago';
  };

  const getTipoPago = (venta: Venta): string => {
    if (!venta.tipoPago) return '—';
    return TIPO_PAGO_LABELS[venta.tipoPago] ?? venta.tipoPago;
  };

  const getCuotaLabel = (venta: Venta): string => {
    if (typeof venta.numeroCuota === 'number' && typeof venta.totalCuotas === 'number') {
      return `${venta.numeroCuota}/${venta.totalCuotas}`;
    }
    if (typeof venta.numeroCuota === 'number') {
      return `${venta.numeroCuota}`;
    }
    return '—';
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

  const handleConfirmCancel = async (motivo: string) => {
    if (!cancelConfirm) return;
    setCancelling(true);
    try {
      await salesApi.cancel(cancelConfirm.id, motivo);
      toast.success('Venta anulada correctamente');
      void fetchVentas();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al anular la venta');
    } finally {
      setCancelling(false);
      setCancelConfirm(null);
    }
  };

  const handleDeleteSale = async () => {
    if (!deleteConfirm) return;
    try {
      await salesApi.remove(deleteConfirm.id);
      void fetchVentas();
      toast.success('Venta eliminada');
      setDeleteConfirm(null);
    } catch {
      toast.error('No se pudo eliminar la venta');
    }
  };

  const columns: DataTableColumn<Venta>[] = [
    { key: 'numero', header: 'Nº Venta', sortable: true, render: (v) => <span className="font-mono text-sm">{v.numero}</span> },
    { key: 'orderId', header: 'Pedido', sortable: true, render: (v) => <span className="font-mono text-xs">{v.orderId?.slice(0, 8) ?? '—'}</span> },
    { key: 'cliente', header: 'Cliente', sortable: true, render: (v) => v.cliente || '—' },
    { key: 'fechaVenta', header: 'Fecha', sortable: true, render: (v) => new Date(v.fechaVenta).toLocaleDateString('es-CO') },
    { key: 'tipoPago', header: 'Tipo', sortable: true, render: (v) => <span className="text-xs">{getTipoPago(v)}</span> },
    { key: 'cuota', header: 'Cuota', sortable: false, render: (v) => <span className="text-xs">{getCuotaLabel(v)}</span> },
    { key: 'medioPago', header: 'Medio', sortable: true, render: (v) => v.medioPago ?? '—' },
    { key: 'total', header: 'Total', sortable: true, render: (v) => <strong className="font-semibold">${v.total.toLocaleString('es-CO')}</strong> },
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
        const variant = estadoPago === 'Pagada' ? 'success' : estadoPago === 'Anulada' || estadoPago === 'Anulado' ? 'danger' : 'warning';
        return <span className={`badge badge-${variant}`}>{estadoPago}</span>;
      },
    },
  ];

  const actions = (v: Venta) => [
    {
      label: 'Ver detalle',
      icon: <FileText size={14} aria-hidden="true" focusable="false" />,
      onClick: (vv: Venta) => { setSelectedVenta(vv); setDetailModalOpen(true); },
    },
    {
      label: 'Generar PDF',
      icon: <FileText size={14} aria-hidden="true" focusable="false" />,
      onClick: async (vv: Venta) => {
        try {
          const html = await salesApi.getPdf(vv.id);
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
    ...(v.estado !== 'ANULADA' && CANCELABLE_ORDER_STATES.includes((v.orderEstado ?? '') as typeof CANCELABLE_ORDER_STATES[number]) ? [{
      label: 'Anular',
      icon: <FileText size={14} aria-hidden="true" focusable="false" />,
      danger: true,
      onClick: (vv: Venta) => {
        if (vv.estado === 'ANULADA') {
          toast.error('La venta ya está anulada');
          return;
        }
        setCancelConfirm(vv);
      },
    }] : []),
    ...(v.estado === 'ANULADA' ? [{
      label: 'Eliminar',
      icon: <Trash2 size={14} aria-hidden="true" focusable="false" />,
      danger: true,
      onClick: (vv: Venta) => setDeleteConfirm(vv),
    }] : []),
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
      { label: 'Tipo de pago', value: getTipoPago(item), icon: <Package size={16} aria-hidden="true" focusable="false" />, tone: 'default' },
      { label: 'Cuota', value: getCuotaLabel(item), icon: <Package size={16} aria-hidden="true" focusable="false" />, tone: 'default' },
      { label: 'Estado pago', value: getEstadoPago(item), icon: <Package size={16} aria-hidden="true" focusable="false" />, tone: 'default' },
    ],
    render: (item) => (
      <div className={s.detailPanel}>
        <div className={s.detailRow}><span>Pedido relacionado:</span> {item.orderId}</div>
        <div className={s.detailRow}><span>Estado del pedido:</span> {item.orderEstado ?? '—'}</div>
        <div className={s.detailRow}><span>Medio de pago:</span> {item.medioPago ?? '—'}</div>
        <div className={s.detailRow}><span>Tipo de pago:</span> {getTipoPago(item)}</div>
        {getCuotaLabel(item) !== '—' && (
          <div className={s.detailRow}><span>Cuota:</span> {getCuotaLabel(item)}</div>
        )}
        <div className={s.detailRow}><span>Estado del pago:</span> {PAYMENT_STATUS_LABELS[item.paymentStatus ?? ''] ?? item.paymentStatus ?? '—'}</div>
        {item.paymentId && <div className={s.detailRow}><span>ID de pago:</span> <span className="font-mono text-xs">{item.paymentId}</span></div>}
        {item.comprobantePagoUrl && (
          <div className={s.detailRow}>
            <span>Comprobante:</span>{' '}
            <a href={item.comprobantePagoUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Ver archivo</a>
          </div>
        )}
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

      <div className={s.toolbar} style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="ID de pedido"
          className={f.input}
          value={filterOrderId}
          onChange={(e) => { setFilterOrderId(e.target.value); pagination.setPage(1); }}
          style={{ maxWidth: 220 }}
        />
        <select
          className={f.select}
          value={filterTipoPago}
          onChange={(e) => { setFilterTipoPago(e.target.value); pagination.setPage(1); }}
          style={{ maxWidth: 200 }}
        >
          <option value="">Tipo de pago (todos)</option>
          <option value="PAGO_INMEDIATO">Pago inmediato</option>
          <option value="ABONO_INICIAL">Anticipo</option>
          <option value="CUOTA">Cuota</option>
          <option value="PAGO_SALDO">Pago de saldo</option>
        </select>
        <select
          className={f.select}
          value={filterPaymentStatus}
          onChange={(e) => { setFilterPaymentStatus(e.target.value); pagination.setPage(1); }}
          style={{ maxWidth: 200 }}
        >
          <option value="">Estado pago (todos)</option>
          <option value="APPROVED">Aprobado</option>
          <option value="PENDING">Pendiente</option>
          <option value="REFUNDED">Reembolsado</option>
          <option value="ANULADO">Anulado</option>
        </select>
        <select
          className={f.select}
          value={filterMedioPago}
          onChange={(e) => { setFilterMedioPago(e.target.value); pagination.setPage(1); }}
          style={{ maxWidth: 180 }}
        >
          <option value="">Medio (todos)</option>
          <option value="CASH">Efectivo</option>
          <option value="TRANSFER">Transferencia</option>
          <option value="CARD">Tarjeta</option>
          <option value="OTHER">Otro</option>
        </select>
        <input
          type="date"
          className={f.input}
          value={filterDesde}
          onChange={(e) => { setFilterDesde(e.target.value); pagination.setPage(1); }}
        />
        <input
          type="date"
          className={f.input}
          value={filterHasta}
          onChange={(e) => { setFilterHasta(e.target.value); pagination.setPage(1); }}
        />
        {(filterOrderId || filterTipoPago || filterPaymentStatus || filterMedioPago || filterDesde || filterHasta) && (
          <Button
            variant="ghost"
            onClick={() => {
              setFilterOrderId('');
              setFilterTipoPago('');
              setFilterPaymentStatus('');
              setFilterMedioPago('');
              setFilterDesde('');
              setFilterHasta('');
              pagination.setPage(1);
            }}
          >
            Limpiar filtros
          </Button>
        )}
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
            <div className={s.detailRow}><span>Tipo de pago:</span> {getTipoPago(selectedVenta)}</div>
            {getCuotaLabel(selectedVenta) !== '—' && (
              <div className={s.detailRow}><span>Cuota:</span> {getCuotaLabel(selectedVenta)}</div>
            )}
            {selectedVenta.paymentId && (
              <div className={s.detailRow}><span>ID de pago:</span> <span className="font-mono text-xs">{selectedVenta.paymentId}</span></div>
            )}
            {selectedVenta.comprobantePagoUrl && (
              <div className={s.detailRow}>
                <span>Comprobante:</span>{' '}
                <a href={selectedVenta.comprobantePagoUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">Ver archivo</a>
              </div>
            )}
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

      <ConfirmWithReasonModal
        open={!!cancelConfirm}
        onClose={() => setCancelConfirm(null)}
        onConfirm={handleConfirmCancel}
        referenceLabel={cancelConfirm ? `Venta ${cancelConfirm.numero}` : undefined}
        loading={cancelling}
      />

      <ConfirmationModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteSale}
        title="Eliminar venta"
        description={`¿Estás seguro de que deseas eliminar la venta "${deleteConfirm?.id}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
};

export default AdminGestionVentas;
