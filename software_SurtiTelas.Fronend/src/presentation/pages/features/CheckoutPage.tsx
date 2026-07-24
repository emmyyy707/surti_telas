import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Upload, BadgePercent } from 'lucide-react';
import { toast } from 'sonner';
import { useCart, useAuth } from '@/app/providers/AppProviders';
import { useClientes } from '@/core/stores';
import { ordersApi } from '@/infrastructure/api/ordersApi';
import type { PedidoItem } from '@/core/types';
import { appContent } from '@/shared/config/appContent';
import './CheckoutPage.css';

const formatCurrency = (value: number) => `$${value.toLocaleString('es-CO')}`;

type PaymentType = 'immediate' | 'installments';

const bankOptions = appContent.checkout.paymentBanks;

const installmentOptions = appContent.checkout.installmentOptions;

const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { clientes } = useClientes();
  const {
    items,
    totalItems,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    clearCart,
  } = useCart();

  const [selectedBank, setSelectedBank] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentType>('immediate');
  const [installments, setInstallments] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const clienteActual = useMemo(() => {
    if (!user?.email) return null;
    return clientes.find(c => c.nombre === user.name || c.nombre === user.email) || null;
  }, [user?.email, user?.name, clientes]);

  const isTrustedCustomer = clienteActual?.isTrustedCustomer ?? false;

  const handlePaymentTypeChange = useCallback((type: PaymentType) => {
    if (type === 'installments' && !isTrustedCustomer) {
      return;
    }
    setPaymentType(type);
  }, [isTrustedCustomer]);

  useEffect(() => {
    if (!isTrustedCustomer && paymentType === 'installments') {
      setPaymentType('immediate');
    }
  }, [isTrustedCustomer, paymentType]);

  const taxesLabel = useMemo(() => `IVA 19%`, []);

  const installmentValue = useMemo(
    () => Math.round((total / installments) * 100) / 100,
    [total, installments],
  );

  const handleBankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBank(event.target.value);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setProofFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('El comprobante no puede superar 10 MB.');
      setProofFile(null);
      return;
    }

    setProofFile(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleConfirm = async () => {
    if (!selectedBank) {
      toast.error('Selecciona un banco antes de continuar.');
      return;
    }

    if (!proofFile) {
      toast.error('Adjunta el comprobante de pago.');
      return;
    }

    if (items.length === 0) {
      toast.error('No hay productos en el carrito.');
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsList: PedidoItem[] = items.map((item) => ({
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.quantity,
      }));

      const observaciones = [
        `Banco: ${selectedBank}`,
        proofFile ? `Comprobante: ${proofFile.name}` : null,
        paymentType === 'installments' ? `Pago por abonos: ${installments} cuotas` : 'Pago inmediato',
        clienteActual?.asesorId ? `Asesor: ${clienteActual.asesorId}` : null,
      ]
        .filter(Boolean)
        .join(' | ');

      if (!clienteActual?.id) {
        toast.error('No se pudo identificar tu perfil de cliente. Contacta con el asesor.');
        return;
      }

      await ordersApi.create({
        clienteId: clienteActual.id,
        asesorId: clienteActual.asesorId,
        itemsList,
        observaciones,
        comprobantePago: proofFile ?? undefined,
      });

      clearCart();
      toast.success('Pago registrado. Tu pedido será confirmado en breve.');
    } catch {
      toast.error('No se pudo registrar el pedido. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <motion.div
        className="checkout-empty"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
      >
        <div>
          <h1>Carrito vacío</h1>
          <p>No hay productos seleccionados para continuar con el checkout.</p>
          <Link to="/catalogo">Volver al catálogo</Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="checkout-page"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <div className="checkout-hero">
        <Link className="checkout-back" to="/carrito">
          <ArrowLeft size={18} />
          Volver al carrito
        </Link>
        <div>
          <span className="checkout-eyebrow">Checkout protegido</span>
          <h1>Finalizar compra</h1>
          <p>
            Hola, {user?.email?.split('@')[0]}. Completa los datos de pago para confirmar tu pedido.
          </p>
        </div>
      </div>

      <div className="checkout-grid">
        <section className="checkout-panel">
          <div className="checkout-panel-header">
            <h2>Productos seleccionados</h2>
            <span>{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</span>
          </div>

          <div className="checkout-items">
            {items.map((item) => (
              <article className="checkout-item" key={item.cartId}>
                <img
                  src={item.imagen || '/assets/images/placeholders/product.svg'}
                  alt={item.nombre}
                  loading="lazy"
                  onError={(event) => {
                    const target = event.currentTarget;
                    if (!target.src.includes('placeholders')) {
                      target.src = '/assets/images/placeholders/product.svg';
                    }
                  }}
                />
                <div className="checkout-item-main">
                  <h3>{item.nombre}</h3>
                  <div className="checkout-item-meta">
                    {item.categoria && <span>{item.categoria}</span>}
                    {item.talla && <span>Talla: {item.talla}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                    <span>Cantidad: {item.quantity}</span>
                  </div>
                </div>
                <strong>{formatCurrency(item.precio * item.quantity)}</strong>
              </article>
            ))}
          </div>
        </section>

        <aside className="checkout-panel checkout-summary">
          <h2>Resumen del pedido</h2>
          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <strong>{formatCurrency(subtotal)}</strong>
          </div>
          {discount > 0 && (
            <div className="checkout-summary-row muted">
              <span>Descuento</span>
              <strong>-{formatCurrency(discount)}</strong>
            </div>
          )}
          <div className="checkout-summary-row muted">
            <span>{taxesLabel}</span>
            <strong>{formatCurrency(tax)}</strong>
          </div>
          <div className="checkout-summary-row muted">
            <span>Envío</span>
            <strong>{shipping === 0 ? 'Gratis' : formatCurrency(shipping)}</strong>
          </div>
          <div className="checkout-summary-total">
            <span>Total</span>
            <strong className="checkout-total-value">{formatCurrency(total)}</strong>
          </div>

          {/* Bank selector */}
          <div className="ch-field">
            <label htmlFor="bank-select" className="ch-label">Selecciona el Banco *</label>
            <select
              id="bank-select"
              className="ch-select"
              value={selectedBank}
              onChange={handleBankChange}
            >
              <option value="">Selecciona tu banco</option>
              {bankOptions.map((bank) => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>

{/* Payment type selector */}
          <div className="ch-field">
            <div className="ch-payment-label">
              <CreditCard size={16} strokeWidth={2.2} />
              Forma de pago *
            </div>
            <div className="ch-payment-grid">
              <button
                type="button"
                className={`ch-pay-card ${paymentType === 'immediate' ? 'active' : ''}`}
                onClick={() => handlePaymentTypeChange('immediate')}
              >
                <span className="ch-pay-badge">Pago inmediato</span>
                <p className="ch-pay-text">
                  Pago completo de tu pedido en una sola transacción.
                </p>
                <span className="ch-pay-total">
                  {formatCurrency(total)}
                </span>
              </button>

              {isTrustedCustomer && (
                <button
                  type="button"
                  className={`ch-pay-card ${paymentType === 'installments' ? 'active' : ''}`}
                  onClick={() => handlePaymentTypeChange('installments')}
                >
                  <span className="ch-pay-badge accent">
                    <BadgePercent size={13} /> Pago por abonos
                  </span>
                  <p className="ch-pay-text">
                    Divide el pago en cuotas cómodas adaptadas a tu presupuesto.
                  </p>
                  <span className="ch-pay-total accent">
                    desde {Math.round((total / 12) * 100) / 100}
                    <span className="ch-pay-total-sub"> /cuota</span>
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Installments block */}
          {paymentType === 'installments' && (
            <div className="ch-installments-block">
              <span className="ch-install-label">Selecciona número de cuotas</span>
              <div className="ch-install-dots">
                {installmentOptions.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`ch-install-dot ${installments === n ? 'active' : ''}`}
                    onClick={() => setInstallments(n)}
                    aria-label={`${n} cuotas`}
                  >
                    <span className="ch-dot-num">{n}</span>
                    <span className="ch-dot-sub">cuotas</span>
                  </button>
                ))}
              </div>

              <div className="ch-install-summary">
                <div className="ch-install-summary-head">
                  <strong>Resumen de cuotas</strong>
                </div>
                <div className="ch-install-summary-row">
                  <span>Total del pedido</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div className="ch-install-summary-row">
                  <span>Número de cuotas</span>
                  <span>{installments}</span>
                </div>
                <div className="ch-install-summary-row total">
                  <span>Valor por cuota</span>
                  <span>{formatCurrency(installmentValue)}</span>
                </div>
                <span className="ch-no-interest">Sin intereses</span>
              </div>
            </div>
          )}

          {/* Proof upload */}
          <div className="ch-field">
            <label className="ch-label">Comprobante de Pago *</label>
            <div className="ch-upload-zone" onClick={handleUploadClick} role="button" tabIndex={0}>
              <Upload size={22} />
              <div>
                <p className="ch-upload-title">
                  {proofFile ? proofFile.name : 'Haz clic para subir tu comprobante'}
                </p>
                <p className="ch-upload-sub">PNG, JPG o JPEG (máx. 10MB)</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="ch-file-input"
              onChange={handleFileSelect}
            />
          </div>

          <div className="ch-notice">
            <strong>Nota:</strong>
            <span>
              Tu pago será verificado por un asesor en las próximas 24 horas. Si tienes dudas, no dudes en ponerte en contacto con nosotros.
            </span>
          </div>

          <div className="ch-actions">
            <button
              className="ch-btn-secondary"
              type="button"
              onClick={() => window.history.back()}
            >
              Cancelar
            </button>
            <button
              className="ch-btn-primary"
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Confirmando…' : 'Confirmar Pedido'}
            </button>
          </div>
        </aside>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;
