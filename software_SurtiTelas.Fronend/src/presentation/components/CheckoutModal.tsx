import React, { useMemo, useRef, useState } from 'react'
import { X, Upload, CreditCard, BadgePercent, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useCart, useAuth } from '@/app/providers/AppProviders'
import { useClientes } from '@/core/stores'
import { ordersApi } from '@/infrastructure/api/ordersApi'
import { AuthRequiredModal } from './AuthRequiredModal'
import { BankingQrCode } from './BankingQrCode'
import { appContent } from '@/shared/config/appContent'
import './CheckoutModal.css'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

type PaymentType = 'immediate' | 'installments'

const installmentOptions = appContent.checkout.installmentOptions

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { subtotal, discount, tax, shipping, total, clearCart, items } = useCart()
  const { isAuthenticated, user } = useAuth();
  const { clientes } = useClientes();
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [paymentType, setPaymentType] = useState<PaymentType>('immediate')
  const [installments, setInstallments] = useState(2)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [paymentResult, setPaymentResult] = useState<'success' | 'error' | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const clienteActual = useMemo(() => {
    if (!user?.email) return null;
    return clientes.find(c => c.email === user.email || c.nombre === user.name || c.nombre === user.email) || null;
  }, [user?.email, user?.name, clientes]);

  const isTrustedCustomer = clienteActual?.isTrustedCustomer ?? false;

  const handlePaymentTypeChange = (type: PaymentType) => {
    if (type === 'installments' && !isTrustedCustomer) return;
    setPaymentType(type);
  }

  const taxesLabel = useMemo(() => `IVA 19%`, [])

  const installmentValue = useMemo(
    () => Math.round((total / installments) * 100) / 100,
    [total, installments],
  )

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
    if (!isAuthenticated) {
      setShowAuthModal(true);
      toast.warning('Necesitas una cuenta para finalizar la compra.');
      return;
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
    try {

      const itemsList = items.map((item) => ({
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.quantity,
      }));

      const observaciones = [
        `Banco: ${appContent.checkout.bankingKey.bankName}`,
        `Cuenta: ${appContent.checkout.bankingKey.accountNumber}`,
        `Beneficiario: ${appContent.checkout.bankingKey.beneficiary}`,
        paymentType === 'installments' ? `Pago por abonos: ${installments} cuotas` : 'Pago inmediato',
        clienteActual?.asesorId ? `Asesor: ${clienteActual.asesorId}` : null,
      ]
        .filter(Boolean)
        .join(' | ');

      if (proofFile) {
         const form = new FormData();
         if (clienteActual?.id) form.append('clienteId', clienteActual.id);
         if (clienteActual?.asesorId) form.append('asesorId', clienteActual.asesorId);
         form.append('itemsList', JSON.stringify(itemsList));
         form.append('prioridad', 'Estándar');
         form.append('observaciones', observaciones);
          form.append('paymentMethod', 'TRANSFER');
         if (paymentType === 'installments') form.append('installments', String(installments));
         form.append('comprobantePago', proofFile);
         await ordersApi.createForm(form);
       } else {
         await ordersApi.create({
           clienteId: clienteActual?.id,
          asesorId: clienteActual?.asesorId,
          itemsList,
          prioridad: 'Estándar',
          observaciones,
          paymentMethod: 'TRANSFER',
          installments: paymentType === 'installments' ? installments : undefined,
        });
      }

clearCart();
       setPaymentResult('success');
       toast.success('Pago registrado. Tu pedido será confirmado en breve.');
       setTimeout(() => { onClose(); setPaymentResult(null); }, 2500);
} catch (error) {
        const errMsg = error instanceof Error ? error.message : '';
        if (errMsg.includes('422') || errMsg.includes('Error de validación')) {
          toast.error('Error en los datos del pedido. Verifica que tu información esté completa e intenta de nuevo.');
        } else if (errMsg.includes('cupo disponible')) {
          toast.error('Tu cliente no tiene cupo disponible. Contacta a tu asesor para actualizar tu límite de crédito.');
        } else if (errMsg.includes('network_error') || errMsg.includes('No se pudo conectar')) {
          toast.error('No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.');
        } else {
          toast.error(errMsg || 'No se pudo registrar el pedido. Intenta nuevamente.');
        }
        setPaymentResult('error');
      } finally {
       setIsSubmitting(false);
     }
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
           {paymentResult === 'success' ? (
             <>
               <h2 className="ch-title" style={{ color: '#16a34a' }}>¡Compra Realizada!</h2>
               <p className="ch-subtitle">Tu pedido ha sido Registrado correctamente.</p>
             </>
           ) : paymentResult === 'error' ? (
             <>
               <h2 className="ch-title" style={{ color: '#dc2626' }}>Error al Registrar el Pago</h2>
               <p className="ch-subtitle">No se pudo procesar tu pedido. Intenta de nuevo.</p>
             </>
           ) : (
             <>
               <h2 className="ch-title">Finalizar Compra</h2>
               <p className="ch-subtitle">Completa los datos de pago para confirmar tu pedido.</p>
             </>
           )}
         </div>

         {/* Body */}
         <div className="ch-body">
           {paymentResult === 'success' ? (
             <div className="ch-success-screen">
               <div className="ch-success-icon">✓</div>
               <p className="ch-success-text">Tu pedido ha sido registrado exitosamente.</p>
               <p className="ch-success-hint">Un asesor se comunicará contigo en las próximas 24 horas para confirmar tu pago.</p>
               <button className="ch-btn-primary" onClick={onClose}>Cerrar</button>
             </div>
           ) : paymentResult === 'error' ? (
             <div className="ch-error-screen">
               <div className="ch-error-icon">✕</div>
               <p className="ch-error-text">Ocurrió un error al registrar tu pedido.</p>
               <p className="ch-error-hint">Puedes intentar nuevamente o contactar a tu asesor.</p>
               <div className="ch-actions">
                 <button className="ch-btn-primary" onClick={() => setPaymentResult(null)}>Intentar de Nuevo</button>
               </div>
             </div>
           ) : (
             <>
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
                 {appContent.checkout.trustBadges.map((item) => (
                   <div className="ch-trust-item" key={item.label}>
                     <ShieldCheck size={14} strokeWidth={2} />
                     <span>{item.label}</span>
                   </div>
                 ))}
               </div>
             </div>
           </aside>

           {/* Form */}
            <section className="ch-form-card">
              {/* Banking QR Code */}
              <div className="ch-field">
                <BankingQrCode amount={total} />
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
                   onClick={() => handlePaymentTypeChange('immediate')}
                 >
                   <span className="ch-pay-badge">Pago inmediato</span>
                   <p className="ch-pay-text">
                     Pago completo de tu pedido en una sola transacción.
                   </p>
                   <span className="ch-pay-total">
                     {total.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
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
               {proofFile && (
                 <div className="ch-proof-preview">
                   <img
                     src={URL.createObjectURL(proofFile)}
                     alt="Vista previa del comprobante"
                     className="ch-proof-img"
                   />
                 </div>
               )}
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
                {isSubmitting ? 'Procesando…' : 'Finalizar Compra'}
              </button>
            </div>
</section>
            </>
          )}
          </div>
        </div>

{showAuthModal && (
        <AuthRequiredModal
          open={showAuthModal}
          onOpenChange={setShowAuthModal}
          onContinueShopping={() => setShowAuthModal(false)}
        />
      )}
    </div>
  )
}


