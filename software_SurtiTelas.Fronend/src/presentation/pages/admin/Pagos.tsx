import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, CheckCircle, AlertTriangle, Clock, FileText, CreditCard, Download, DollarSign, ChevronDown, X, Loader2, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { SearchInput } from '@/shared/ui/SearchInput';
import s from './Pagos.module.css';
import f from '@/styles/Form.module.css';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DataTable } from '../../../shared/ui/DataTable';
import { Modal } from '../../../shared/ui/Modal';
import { ConfirmationModal } from '@/shared/ui/ConfirmationModal';
import { paymentsApi, type Payment } from '@/infrastructure/api/paymentsApi';
import { ordersApi } from '@/infrastructure/api/ordersApi';
import { authApi } from '@/infrastructure/api/authApi';
import { useAuthStore } from '@/core/stores/authStore';
import { ModalFooter } from '@/shared/ui/ModalFooter';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

interface Factura {
  id: string;
  numeroFactura: string;
  cliente: string;
  total: number;
  abonado: number;
  saldo: number;
  cuotasTotales: number;
  cuotasPagadas: number;
  fechaProximaCuota: string;
  estado: 'Pendiente' | 'Parcial' | 'Pagado' | 'Vencido' | 'En Mora';
  metodoPago: 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Credito';
  fechaCreacion: string;
  vendedor: string;
}

interface Abono {
  id: string;
  facturaId: string;
  numeroFactura: string;
  cliente: string;
  valor: number;
  fecha: string;
  metodoPago: string;
  concepto: string;
  recibidoPor: string;
}

interface PaymentForm {
  amount: string;
  method: 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Otro';
  reference: string;
  notes: string;
}

const facturasFromPayments = (payments: Payment[]): Factura[] => {
  const seen = new Set<string>();
  return payments
    .filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    })
    .map((p) => {
    const aprobado = p.status === 'Aprobado';
    const rechazado = p.status === 'Rechazado';
    const reembolsado = p.status === 'Reembolsado';
    const total = p.amount;
    const abonado = aprobado || reembolsado ? p.amount : 0;
    const saldo = total - abonado;
    const estado: Factura['estado'] = rechazado
      ? 'Vencido'
      : reembolsado
        ? 'Pagado'
        : aprobado
          ? 'Pagado'
          : 'Pendiente';
    return {
      id: p.id,
      numeroFactura: p.orderId,
      cliente: p.customerId,
      total,
      abonado,
      saldo,
      cuotasTotales: 1,
      cuotasPagadas: aprobado || reembolsado ? 1 : 0,
      fechaProximaCuota: p.paidAt ?? '-',
      estado,
      metodoPago: p.method === 'Tarjeta' ? 'Tarjeta' : p.method === 'Efectivo' ? 'Efectivo' : 'Transferencia',
      fechaCreacion: p.createdAt.split('T')[0],
      vendedor: p.asesorId ?? 'Sin asesor',
    };
  });
};

const abonosFromPayments = (payments: Payment[]): Abono[] => {
  const seen = new Set<string>();
  return payments
    .filter((p) => {
      if (p.status !== 'Aprobado') return false;
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    })
    .map((p) => ({
      id: p.id,
      facturaId: p.orderId,
      numeroFactura: p.orderId,
      cliente: p.customerId,
      valor: p.amount,
      fecha: (p.paidAt ?? p.createdAt).split('T')[0],
      metodoPago: p.method === 'Tarjeta' ? 'Tarjeta' : p.method === 'Efectivo' ? 'Efectivo' : 'Transferencia',
      concepto: p.reference ?? p.notes ?? 'Pago de factura',
      recibidoPor: p.asesorId ?? 'Sistema',
    }));
};

export const AdminPagos: React.FC = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [filtroEstado, setFiltroEstado] = useState<'Todos' | 'Pendiente' | 'Parcial' | 'Pagado' | 'Vencido' | 'En Mora'>('Todos');
  const [filtroMetodo, setFiltroMetodo] = useState<string>('Todos');
  const [modalAbonoOpen, setModalAbonoOpen] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [nuevoAbono, setNuevoAbono] = useState({ valor: '', metodo: 'Transferencia', concepto: '', fecha: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Payment | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    amount: '',
    method: 'Transferencia',
    reference: '',
    notes: '',
  });

  const [saldoClienteId, setSaldoClienteId] = useState('');
  const [saldoQuoteId, setSaldoQuoteId] = useState('');
  const [saldoCliente, setSaldoCliente] = useState<{ customerId: string; totalPaid: number; pending: number } | null>(null);
  const [saldoQuote, setSaldoQuote] = useState<{ quoteId: string; total: number; totalPaid: number; saldo: number; porcentajeAnticipo: number; valorAnticipo: number } | null>(null);
  const [loadingSaldo, setLoadingSaldo] = useState(false);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const user = useAuthStore.getState().user;
      const isAdmin = user?.role === 'admin';

      let clientesIds = new Set<string>();
      if (!isAdmin) {
        const clientesResult = await authApi.listUsers({ limit: 100, role: 'CLIENTE' });
        clientesIds = new Set((clientesResult.data ?? []).map(c => c.id));
      }

      const [paymentsData, ordersData] = await Promise.all([
        paymentsApi.list(),
        ordersApi.list(),
      ]);

      const pagosFiltrados = isAdmin ? paymentsData : paymentsData.filter(p => clientesIds.has(p.customerId));
      const allOrders = isAdmin
        ? (ordersData.pedidos ?? []).filter(o => typeof o.clienteId === 'string' && o.clienteId.trim().length > 0)
        : (ordersData.pedidos ?? []).filter(o => typeof o.clienteId === 'string' && o.clienteId.trim().length > 0 && clientesIds.has(o.clienteId));

      const pagosPorPedido = new Map(pagosFiltrados.map(p => [p.orderId, p]));
      const acceptedOrders = allOrders.filter(o => o.estado === 'Aceptado');
      const deliveredOrders = allOrders.filter(o => o.estado === 'Entregado');
      const ordersSinPago = acceptedOrders.filter(o => !pagosPorPedido.has(o.id));
      const deliveredSinPago = deliveredOrders.filter(o => !pagosPorPedido.has(o.id));

      const pagosDesdePedidos: Payment[] = [
        ...ordersSinPago.map((o): Payment => ({
          id: o.id,
          orderId: o.id,
          customerId: o.clienteId ?? '',
          asesorId: o.asesorId,
          amount: Number(o.total),
          method: 'Transferencia',
          status: 'Pendiente',
          reference: o.observaciones ?? undefined,
          notes: 'Pago pendiente por pedido aceptado',
          paidAt: undefined,
          createdAt: o.fecha,
          updatedAt: o.fecha,
        })),
        ...deliveredSinPago.map((o): Payment => ({
          id: o.id,
          orderId: o.id,
          customerId: o.clienteId ?? '',
          asesorId: o.asesorId,
          amount: Number(o.total),
          method: 'Transferencia',
          status: 'Aprobado',
          reference: o.observaciones ?? undefined,
          notes: 'Pago completado por pedido entregado',
          paidAt: o.fecha,
          createdAt: o.fecha,
          updatedAt: o.fecha,
        })),
        ...allOrders
          .filter(o => (o.estado === 'Aceptado' || o.estado === 'Entregado') && pagosPorPedido.has(o.id))
          .map((o): Payment => pagosPorPedido.get(o.id)!),
      ];

      setPayments([...pagosFiltrados, ...pagosDesdePedidos]);
    } catch {
      setError('No se pudieron cargar los pagos. Intenta nuevamente.');
      toast.error('Error al cargar los pagos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    const handler = () => {
      void loadPayments();
    };
    window.addEventListener('receipt:paid', handler as EventListener);
    return () => window.removeEventListener('receipt:paid', handler as EventListener);
  }, [loadPayments]);

  const facturas = useMemo(() => facturasFromPayments(payments), [payments]);
  const abonos = useMemo(() => abonosFromPayments(payments), [payments]);

  const filteredFacturas = useMemo(() => {
    return facturas.filter(f =>
      (filtroEstado === 'Todos' || f.estado === filtroEstado) &&
      (filtroMetodo === 'Todos' || f.metodoPago === filtroMetodo) &&
      (f.numeroFactura.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        f.cliente.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        f.vendedor.toLowerCase().includes(debouncedSearch.toLowerCase()))
    );
  }, [debouncedSearch, filtroEstado, filtroMetodo, facturas]);

  const metodosUnicos = Array.from(new Set(facturas.map(f => f.metodoPago)));

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Pagado': return 'success';
      case 'Parcial': return 'primary';
      case 'Pendiente': return 'default';
      case 'Vencido': return 'warning';
      case 'En Mora': return 'danger';
      default: return 'default';
    }
  };

  const getMetodoIcon = (metodo: string) => {
    switch (metodo) {
      case 'Efectivo': return <DollarSign size={14} />;
      case 'Transferencia': return <FileText size={14} />;
      case 'Tarjeta': return <CreditCard size={14} />;
      case 'Credito': return <CreditCard size={14} />;
      default: return <DollarSign size={14} />;
    }
  };

  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(valor);
  };

  const stats = {
    totalFacturado: facturas.reduce((sum, f) => sum + f.total, 0),
    totalAbonado: facturas.reduce((sum, f) => sum + f.abonado, 0),
    totalSaldo: facturas.reduce((sum, f) => sum + f.saldo, 0),
    vencidas: facturas.filter(f => f.estado === 'Vencido' || f.estado === 'En Mora').length,
    porVencer: facturas.filter(f => f.estado === 'Parcial' || f.estado === 'Pendiente').length,
  };

  const _handleVerDetalle = (factura: Factura) => {
    setSelectedFactura(factura);
  };

  const handleRegistrarAbono = (factura: Factura) => {
    setSelectedFactura(factura);
    setNuevoAbono({ valor: '', metodo: 'Transferencia', concepto: '', fecha: new Date().toISOString().split('T')[0] });
    setModalAbonoOpen(true);
  };

  const handleGuardarAbono = async () => {
    if (!selectedFactura || !nuevoAbono.valor) return;
    const valor = Number(nuevoAbono.valor);
    if (valor <= 0 || valor > selectedFactura.saldo) {
      toast.error(`El valor del abono debe ser mayor a 0 y menor o igual al saldo pendiente (${formatCurrency(selectedFactura.saldo)})`);
      return;
    }
    try {
      await paymentsApi.create({
        orderId: selectedFactura.id,
        customerId: selectedFactura.cliente,
        asesorId: selectedFactura.vendedor,
        amount: valor,
        method: nuevoAbono.metodo === 'Efectivo' ? 'Efectivo' : nuevoAbono.metodo === 'Transferencia' ? 'Transferencia' : nuevoAbono.metodo === 'Tarjeta' ? 'Tarjeta' : 'Otro',
        reference: nuevoAbono.concepto,
        notes: `Abono factura ${selectedFactura.numeroFactura}`,
      });
      toast.success(`Abono de ${formatCurrency(valor)} registrado para factura ${selectedFactura.numeroFactura}`);
      await loadPayments();
      setModalAbonoOpen(false);
      setNuevoAbono({ valor: '', metodo: 'Transferencia', concepto: '', fecha: '' });
    } catch {
      toast.error('No se pudo registrar el abono');
    }
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setPaymentForm({
      amount: String(payment.amount),
      method: payment.method === 'Efectivo' ? 'Efectivo' : payment.method === 'Transferencia' ? 'Transferencia' : payment.method === 'Tarjeta' ? 'Tarjeta' : 'Otro',
      reference: payment.reference || '',
      notes: payment.notes || '',
    });
    setEditModalOpen(true);
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment) return;
    setSaving(true);
    try {
      const updated = await paymentsApi.update(editingPayment.id, {
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
        reference: paymentForm.reference || undefined,
        notes: paymentForm.notes || undefined,
      });
      setPayments(prev => prev.map(p => p.id === editingPayment.id ? updated : p));
      toast.success('Pago actualizado correctamente');
      setEditModalOpen(false);
      setEditingPayment(null);
    } catch {
      toast.error('No se pudo actualizar el pago');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = async () => {
    if (!deleteConfirm) return;
    try {
      await paymentsApi.remove(deleteConfirm.id);
      setPayments(prev => prev.filter(p => p.id !== deleteConfirm.id));
      toast.success('Pago eliminado');
      setDeleteConfirm(null);
    } catch {
      toast.error('No se pudo eliminar el pago');
    }
  };

  const handleCalcularSaldoCliente = async () => {
    if (!saldoClienteId.trim()) return;
    setLoadingSaldo(true);
    try {
      const data = await paymentsApi.getCustomerBalance(saldoClienteId.trim());
      setSaldoCliente(data);
      toast.success('Saldo calculado');
    } catch {
      toast.error('No se pudo calcular el saldo');
    } finally {
      setLoadingSaldo(false);
    }
  };

  const handleCalcularSaldoQuote = async () => {
    if (!saldoQuoteId.trim()) return;
    setLoadingSaldo(true);
    try {
      const data = await paymentsApi.getQuoteBalance(saldoQuoteId.trim());
      setSaldoQuote(data);
      toast.success('Saldo de cotización calculado');
    } catch {
      toast.error('No se pudo calcular el saldo de la cotización');
    } finally {
      setLoadingSaldo(false);
    }
  };

  const handleExportPdf = async (payment: Payment) => {
    try {
      const blob = await paymentsApi.exportPdf(payment.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pago-${payment.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF descargado');
    } catch {
      toast.error('No se pudo generar el PDF');
    }
  };

  const abonosDeFactura = (facturaId: string) => abonos.filter(a => a.facturaId === facturaId);

  return (
    <div>
      {loading && (
        <div className={s.header}>
          <div>
            <h1 className={s.pageTitle}>Pagos, abonos y financiación</h1>
            <p className={s.pageSubtitle}>Registro y gestión de pagos parciales y planes de financiación</p>
          </div>
          <div className={s.headerActions}>
            <Loader2 size={20} className={s.loadingSpinner} />
            <span className={s.loadingText}>Cargando pagos…</span>
          </div>
        </div>
      )}

      {error && (
        <div className={s.errorBanner}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <Button variant="secondary" onClick={() => void loadPayments()}>Reintentar</Button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className={s.header}>
            <div>
              <h1 className={s.pageTitle}>Pagos, abonos y financiación</h1>
              <p className={s.pageSubtitle}>Registro y gestión de pagos parciales y planes de financiación</p>
            </div>
            <div className={s.headerActions}>
              <Button leftIcon={<Plus size={16} />} onClick={() => {
                const pendiente = facturas.find(f => f.saldo > 0);
                if (pendiente) {
                  handleRegistrarAbono(pendiente);
                } else {
                  toast.info('No hay facturas con saldo pendiente para registrar abono');
                }
              }}>
                Nuevo abono
              </Button>
            </div>
          </div>

          <div className={s.statsRow}>
            <div className={s.statCard}>
              <DollarSign size={20} className={s.statIcon} />
              <div>
                <div className={s.statValue}>{formatCurrency(stats.totalFacturado)}</div>
                <div className={s.statLabel}>Total Facturado</div>
              </div>
            </div>
            <div className={`${s.statCard} ${s.statCardSuccess}`}>
              <CheckCircle size={20} className={s.statIconSuccess} />
              <div>
                <div className={s.statValue}>{formatCurrency(stats.totalAbonado)}</div>
                <div className={s.statLabel}>Total Abonado</div>
              </div>
            </div>
            <div className={`${s.statCard} ${s.statCardWarning}`}>
              <Clock size={20} className={s.statIconWarning} />
              <div>
                <div className={s.statValue}>{formatCurrency(stats.totalSaldo)}</div>
                <div className={s.statLabel}>Saldo Pendiente</div>
              </div>
            </div>
            <div className={`${s.statCard} ${s.statCardDanger}`}>
              <AlertTriangle size={20} className={s.statIconDanger} />
              <div>
                <div className={s.statValue}>{stats.vencidas}</div>
                <div className={s.statLabel}>En Mora / Vencidas</div>
              </div>
            </div>
            <div className={s.statCard}>
              <FileText size={20} className={s.statIconPrimary} />
              <div>
                <div className={s.statValue}>{stats.porVencer}</div>
                <div className={s.statLabel}>Por Vencer</div>
              </div>
            </div>
          </div>

          <div className={s.toolbar}>
            <SearchInput
              placeholder="Buscar por factura, cliente o vendedor..."
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
                {['Todos', 'Pendiente', 'Parcial', 'Pagado', 'Vencido', 'En Mora'].map(estado => (
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
                {['Todos', ...metodosUnicos].map(metodo => (
                  <button
                    key={metodo}
                    className={`${s.filterBtn} ${filtroMetodo === metodo ? s.filterBtnActive : ''}`}
                    onClick={() => setFiltroMetodo(metodo)}
                  >
                    {metodo !== 'Todos' && getMetodoIcon(metodo)}
                    {metodo}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={s.saldoSection}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>Lógica financiera</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className={f.field}>
                <label className={f.label}>Saldo restante por cliente (ID)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className={f.input} value={saldoClienteId} onChange={(e) => setSaldoClienteId(e.target.value)} placeholder="ID del cliente" />
                  <Button type="button" onClick={handleCalcularSaldoCliente} disabled={loadingSaldo}>Calcular</Button>
                </div>
                {saldoCliente && (
                  <div style={{ marginTop: 8, fontSize: '0.85rem' }}>
                    <div>Total abonado: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(saldoCliente.totalPaid)}</div>
                    <div>Pendiente: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(saldoCliente.pending)}</div>
                  </div>
                )}
              </div>
              <div className={f.field}>
                <label className={f.label}>Saldo restante de cotización (ID)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className={f.input} value={saldoQuoteId} onChange={(e) => setSaldoQuoteId(e.target.value)} placeholder="ID de la cotización" />
                  <Button type="button" onClick={handleCalcularSaldoQuote} disabled={loadingSaldo}>Calcular</Button>
                </div>
                {saldoQuote && (
                  <div style={{ marginTop: 8, fontSize: '0.85rem' }}>
                    <div>Total cotización: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(saldoQuote.total)}</div>
                    <div>Total pagado: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(saldoQuote.totalPaid)}</div>
                    <div>Saldo: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(saldoQuote.saldo)}</div>
                    <div>Anticipo {saldoQuote.porcentajeAnticipo}%: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(saldoQuote.valorAnticipo)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DataTable<Factura>
            data={filteredFacturas}
            pageSize={10}
            emptyMessage="No se encontraron facturas con pagos registrados"
            maxVisibleColumns={5}
            modalSize="xl"
            enableExport
            exportFileName="pagos"
            detailPanel={{
              title: (f) => `Factura ${f.numeroFactura}`,
              render: (f) => (
                <div className={s.detailPanel}>
                  <div className={s.detailSection}>
                    <h4 className={s.detailSectionTitle}>Información de la factura</h4>
                    <div className={s.detailGrid}>
                      <div className={s.detailItem}><span className={s.detailLabel}>Cliente</span><span>{f.cliente}</span></div>
                      <div className={s.detailItem}><span className={s.detailLabel}>Vendedor</span><span>{f.vendedor}</span></div>
                      <div className={s.detailItem}><span className={s.detailLabel}>Total</span><span className={s.tdBold}>{formatCurrency(f.total)}</span></div>
                      <div className={s.detailItem}><span className={s.detailLabel}>Abonado</span><span className={s.abonadoPositive}>{formatCurrency(f.abonado)}</span></div>
                      <div className={s.detailItem}><span className={s.detailLabel}>Saldo</span><span className={f.saldo > 0 ? s.saldoNegative : ''}>{formatCurrency(f.saldo)}</span></div>
                      <div className={s.detailItem}><span className={s.detailLabel}>Cuotas</span><span>{f.cuotasPagadas}/{f.cuotasTotales}</span></div>
                    </div>
                  </div>
                  <div className={s.detailSection}>
                    <h4 className={s.detailSectionTitle}>Información adicional</h4>
                    <div className={s.detailGrid}>
                      <div className={s.detailItem}><span className={s.detailLabel}>Fecha próxima cuota</span><span>{f.fechaProximaCuota}</span></div>
                      <div className={s.detailItem}><span className={s.detailLabel}>Método de pago</span><span>{f.metodoPago}</span></div>
                      <div className={s.detailItem}><span className={s.detailLabel}>Fecha creación</span><span>{f.fechaCreacion}</span></div>
                    </div>
                  </div>
                  <div className={s.detailSection}>
                    <h4 className={s.detailSectionTitle}>Historial de Abonos</h4>
                    {abonosDeFactura(f.id).length === 0 ? (
                      <p className={s.noAbonos}>Sin abonos registrados</p>
                    ) : (
                      <div className={s.abonosList}>
                        {abonosDeFactura(f.id).map(abono => (
                          <div key={abono.id} className={s.abonoRow}>
                            <div className={s.abonoInfo}>
                              <div className={s.abonoFecha}>{abono.fecha}</div>
                              <div className={s.abonoConcepto}>{abono.concepto}</div>
                              <div className={s.abonoMetodo}>{abono.metodoPago} · {abono.recibidoPor}</div>
                            </div>
                            <div className={s.abonoValor}>+{formatCurrency(abono.valor)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ),
            }}
            actions={(f) => [
              ...(f.saldo > 0 ? [{ label: 'Registrar abono', icon: <DollarSign size={14} />, onClick: () => handleRegistrarAbono(f) }] : []),
              ...(f.estado !== 'Pagado' ? [{ label: 'Aprobar', icon: <CheckCircle size={14} />, onClick: async () => { await paymentsApi.updateStatus(f.id, 'Aprobado'); await loadPayments(); toast.success(`Pago ${f.numeroFactura} aprobado`); } }] : []),
              ...(f.estado === 'Pendiente' || f.estado === 'Parcial' ? [{ label: 'Rechazar', icon: <X size={14} />, onClick: async () => { await paymentsApi.updateStatus(f.id, 'Rechazado'); await loadPayments(); toast.success(`Pago ${f.numeroFactura} rechazado`); } }] : []),
              ...(f.estado === 'Pagado' ? [{ label: 'Reembolsar', icon: <Download size={14} />, onClick: async () => { await paymentsApi.updateStatus(f.id, 'Reembolsado'); await loadPayments(); toast.success(`Pago ${f.numeroFactura} reembolsado`); } }] : []),
               { label: 'Editar', icon: <Edit size={14} />, onClick: () => handleEditPayment(payments.find(p => p.id === f.id)!) },
               { label: 'Anular', icon: <Trash2 size={14} />, onClick: () => setDeleteConfirm(payments.find(p => p.id === f.id)!), danger: true },
               { label: 'PDF', icon: <FileText size={14} />, onClick: () => handleExportPdf(payments.find(p => p.id === f.id)!) },
            ]}
            columns={[
              { key: 'numeroFactura', header: 'N° Factura', width: '120px', sortable: true, filterable: true, filterPlaceholder: 'Filtrar factura...', render: (f) => <span className={s.tdPrimary}>{f.numeroFactura}</span> },
              { key: 'cliente', header: 'Cliente', sortable: true, filterable: true, render: (f) => f.cliente },
              { key: 'vendedor', header: 'Vendedor', width: '130px', sortable: true, render: (f) => f.vendedor },
              { key: 'total', header: 'Total', width: '120px', sortable: true, align: 'right', render: (f) => <span className={`${s.tdRight} ${s.tdBold}`}>{formatCurrency(f.total)}</span> },
              { key: 'estado', header: 'Estado', width: '110px', sortable: true, filterable: true, filterType: 'select', filterOptions: [
                { value: 'Pendiente', label: 'Pendiente' },
                { value: 'Parcial', label: 'Parcial' },
                { value: 'Pagado', label: 'Pagado' },
                { value: 'Vencido', label: 'Vencido' },
                { value: 'En Mora', label: 'En Mora' },
              ], render: (f) => (
                <Badge variant={getEstadoBadge(f.estado)}>{f.estado}</Badge>
              )},
            ]}
          />
        </>
      )}

      <Modal
        open={modalAbonoOpen}
        onClose={() => setModalAbonoOpen(false)}
        title={`Registrar abono - ${selectedFactura?.numeroFactura}`}
        size="md"
        variant="form"
      >
        <div className={f.form}>
          <div className={f.formSection}>
            <h3 className={f.sectionTitle}>Información de la factura</h3>
            <div className={f.formRow}>
              <div className={f.field}>
                <label className={f.label}>Cliente</label>
                <input type="text" className={f.input} value={selectedFactura?.cliente ?? ''} readOnly />
              </div>
              <div className={f.field}>
                <label className={f.label}>Saldo pendiente</label>
                <input type="text" className={f.input} value={selectedFactura ? formatCurrency(selectedFactura.saldo) : ''} readOnly />
              </div>
            </div>
          </div>

          <div className={f.formSection}>
            <h3 className={f.sectionTitle}>Detalle del abono</h3>
            <div className={f.formRow}>
              <div className={f.field}>
                <label className={f.label}>Valor del abono *</label>
                <input
                  type="number"
                  className={f.input}
                  value={nuevoAbono.valor}
                  onChange={e => setNuevoAbono({ ...nuevoAbono, valor: e.target.value })}
                  placeholder="Ingrese el valor"
                  min={1}
                  max={selectedFactura?.saldo ?? 0}
                />
              </div>
              <div className={f.field}>
                <label className={f.label}>Método de pago</label>
                <select
                  className={f.select}
                  value={nuevoAbono.metodo}
                  onChange={e => setNuevoAbono({ ...nuevoAbono, metodo: e.target.value })}
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Credito">Crédito</option>
                </select>
              </div>
            </div>
            <div className={f.formRow}>
              <div className={f.field}>
                <label className={f.label}>Fecha</label>
                <input
                  type="date"
                  className={f.input}
                  value={nuevoAbono.fecha}
                  onChange={e => setNuevoAbono({ ...nuevoAbono, fecha: e.target.value })}
                />
              </div>
              <div className={f.field}>
                <label className={f.label}>Concepto / Observación</label>
                <input
                  type="text"
                  className={f.input}
                  value={nuevoAbono.concepto}
                  onChange={e => setNuevoAbono({ ...nuevoAbono, concepto: e.target.value })}
                  placeholder="Ej: Abono cuota 2/3"
                />
              </div>
            </div>
          </div>

          <div className={f.formActions}>
            <ModalFooter
              actions={[{ label: 'Cancelar', variant: 'secondary', onClick: () => setModalAbonoOpen(false) }, { label: 'Guardar abono', onClick: handleGuardarAbono, leftIcon: <DollarSign size={16} /> }]} />
          </div>
        </div>
      </Modal>

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Editar pago" size="md" variant="form">
        <form onSubmit={e => { e.preventDefault(); handleUpdatePayment(); }} className={f.form}>
          <div className={f.formSection}>
            <h3 className={f.sectionTitle}>Información del pago</h3>
            <div className={f.formRow}>
              <div className={f.field}>
                <label className={f.label}>Monto *</label>
                <input type="number" className={f.input} value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} required min="0" />
              </div>
              <div className={f.field}>
                <label className={f.label}>Método de pago</label>
                <select className={f.select} value={paymentForm.method} onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value as PaymentForm['method'] })}>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
          </div>

          <div className={f.formSection}>
            <h3 className={f.sectionTitle}>Detalles adicionales</h3>
            <div className={f.formRow}>
              <div className={f.field}>
                <label className={f.label}>Referencia</label>
                <input type="text" className={f.input} value={paymentForm.reference} onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })} />
              </div>
              <div className={f.field}>
                <label className={f.label}>Notas</label>
                <textarea className={f.textarea} value={paymentForm.notes} onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })} rows={3} />
              </div>
            </div>
          </div>

          <div className={f.formActions}>
            <ModalFooter
              actions={[{ label: 'Cancelar', variant: 'secondary', type: 'button', onClick: () => setEditModalOpen(false), disabled: saving }, { label: saving ? 'Guardando...' : 'Guardar cambios' , type: 'submit', disabled: saving }]} />
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeletePayment}
        title="Anular pago"
        description={`¿Estás seguro de que deseas anular el pago "${deleteConfirm?.id}"? Esta acción no se puede deshacer.`}
        confirmLabel="Anular"
        variant="danger"
      />
    </div>
  );
};
