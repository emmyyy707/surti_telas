import React, { useMemo, useRef, useState } from 'react'
import { X, Upload, CreditCard, BadgePercent, ShieldCheck, BadgeCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useCart } from '@presentation/contexts/CartContext'
import './CheckoutModal.css'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

type PaymentType = 'immediate' | 'installments'

const bankOptions = [
  'Bancolombia',
  'Davivienda',
  'BBVA',
  'Banco de Bogotá',
  'Nequi',
]

const installmentOptions = [2, 3, 4, 6, 12]

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { subtotal, discount, tax, shipping, total, clearCart, items } = useCart()
  const [selectedBank, setSelectedBank] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [paymentType, setPaymentType] = useState<PaymentType>('immediate')
  const [installments, setInstallments] = useState(2)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const taxesLabel = useMemo(() => `IVA 19%`, [])

  const installmentValue = useMemo(
    () => Math.round((total / installments) * 100) / 100,
    [total, installments],
  )

  const handleBankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBank(event.target.value)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    if (!file) {
      setProofFile(null)
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('El comprobante no puede superar 10 MB.')
      setProofFile(null)
      return
    }

    setProofFile(file)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleConfirm = async () => {
    if (!selectedBank) {
      toast.error('Selecciona un banco antes de continuar.')
      return
    }

    if (!proofFile) {
      toast.error('Adjunta el comprobante de pago.')
      return
    }

    if (items.length === 0) {
      toast.error('No hay productos en el carrito.')
      onClose()
      return
    }

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 850))
    clearCart()
    setIsSubmitting(false)
    toast.success('Pago registrado. Tu pedido será confirmado en breve.')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="ch-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Finalizar compra"
    >
      <div
        className="ch-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* â”€â”€ Close button â”€â”€ */}
        <button
          className="ch-close-btn"
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          <X size={18} />
        </button>

        {/*Header*/}
        <div className="ch-header">
          <h2 className="ch-title">Finalizar Compra</h2>
          <p className="ch-subtitle">Completa los datos de pago para confirmar tu pedido.</p>
        </div>

        {/* Body */}
        <div className="ch-body">
          {/* Summary */}
          <aside className="ch-summary-card">
            <div className="ch-summary-top">
              <h3 className="ch-section-title">Resumen del Pedido</h3>
              <span className="ch-items-count">{items.length} {items.length === 1 ? 'producto' : 'productos'}</span>
            </div>

            <ul className="ch-summary-list">
              <li className="ch-summary-row">
                <span>Subtotal</span>
                <strong>{subtotal.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</strong>
              </li>
              {discount > 0 && (
                <li className="ch-summary-row muted">
                  <span>Descuento</span>
                  <strong>-{discount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</strong>
                </li>
              )}
              <li className="ch-summary-row muted">
                <span>{taxesLabel}</span>
                <strong>{tax.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</strong>
              </li>
              <li className="ch-summary-row muted">
                <span>Envi­o</span>
                <strong>{shipping === 0 ? 'Gratis' : shipping.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</strong>
              </li>
            </ul>

            <div className="ch-summary-spacer" />

            <div className="ch-divider" />

            <div className="ch-summary-footer">
              <div className="ch-summary-row ch-total-row">
                <span>Total</span>
                <strong className="ch-total-value">
                  {total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                </strong>
              </div>

              <div className="ch-trust-badges">
                <div className="ch-trust-item">
                  <ShieldCheck size={14} strokeWidth={2} />
                  <span>Pago seguro</span>
                </div>
                <div className="ch-trust-item">
                  <BadgeCheck size={14} strokeWidth={2} />
                  <span>Compra protegida</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Form */}
          <section className="ch-form-card">
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
                {/* Immediate payment card */}
                <button
                  type="button"
                  className={`ch-pay-card ${paymentType === 'immediate' ? 'active' : ''}`}
                  onClick={() => setPaymentType('immediate')}
                >
                  <span className="ch-pay-badge">Pago inmediato</span>
                  <p className="ch-pay-text">
                    Pago completo de tu pedido en una sola transacción.
                  </p>
                  <span className="ch-pay-total">
                    {total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
                  </span>
                </button>

                {/* Installments card */}
                <button
                  type="button"
                  className={`ch-pay-card ${paymentType === 'installments' ? 'active' : ''}`}
                  onClick={() => setPaymentType('installments')}
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
              </div>
            </div>

            {/* Installments block  —  conditional */}
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

                {/* Summary */}
                <div className="ch-install-summary">
                  <div className="ch-install-summary-head">
                    <strong>Resumen de cuotas</strong>
                  </div>
                  <div className="ch-install-summary-row">
                    <span>Total del pedido</span>
                    <span>{total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
                  </div>
                  <div className="ch-install-summary-row">
                    <span>Número de cuotas</span>
                    <span>{installments}</span>
                  </div>
                  <div className="ch-install-summary-row total">
                    <span>Valor por cuota</span>
                    <span>{installmentValue.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span>
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

            {/* Notice */}
            <div className="ch-notice">
              <strong>Nota:</strong>
              <span>
                Tu pago será verificado por un asesor en las proximas 24 horas. Si tienes dudas, no dudes en ponerte en contacto con nosotros.
              </span>
            </div>

            {/* Actions */}
            <div className="ch-actions">
              <button
                className="ch-btn-secondary"
                type="button"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                className="ch-btn-primary"
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Confirmandoâ€¦' : 'Confirmar Pedido'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}


