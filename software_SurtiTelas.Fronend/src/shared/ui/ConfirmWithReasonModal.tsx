import { useEffect, useId, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Modal } from './Modal';
import { Button } from './Button';
import styles from './ConfirmWithReasonModal.module.css';

export interface ConfirmWithReasonModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
  title?: string;
  description?: string;
  /** Texto visible que identifica el elemento afectado, p.ej. "Venta PED-523284". */
  referenceLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  helpText?: string;
  /** Límite máximo de caracteres (debe coincidir con la validación del backend). */
  maxLength?: number;
  /** Longitud mínima requerida para habilitar la confirmación. */
  minLength?: number;
  loading?: boolean;
}

const DEFAULT_MAX_LENGTH = 500;
const DEFAULT_MIN_LENGTH = 3;

export const ConfirmWithReasonModal = ({
  open,
  onClose,
  onConfirm,
  title = 'Anular venta',
  description = 'Para continuar, ingresa el motivo por el cual deseas anular la venta. Esta acción no se puede deshacer.',
  referenceLabel,
  confirmLabel = 'Anular venta',
  cancelLabel = 'Cancelar',
  reasonLabel = 'Motivo de la anulación',
  reasonPlaceholder = 'Escribe aquí el motivo de la anulación...',
  helpText = 'Sé claro y específico. Esto ayudará al control y seguimiento.',
  maxLength = DEFAULT_MAX_LENGTH,
  minLength = DEFAULT_MIN_LENGTH,
  loading = false,
}: ConfirmWithReasonModalProps) => {
  const [reason, setReason] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const reasonId = useId();
  const counterId = useId();
  const errorId = useId();

  const trimmedLength = reason.trim().length;
  const isEmpty = trimmedLength === 0;
  const tooShort = !isEmpty && trimmedLength < minLength;
  const isValid = !isEmpty && !tooShort;

  useEffect(() => {
    if (!open) return;
    setReason('');
    const t = window.setTimeout(() => textareaRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [open]);

  const handleConfirm = () => {
    if (loading || !isValid) return;
    void onConfirm(reason.trim());
  };

  const footer = (
    <div className={styles.footer}>
      <Button
        type="button"
        variant="outline"
        size="md"
        onClick={onClose}
        disabled={loading}
      >
        {cancelLabel}
      </Button>
      <Button
        type="button"
        variant="danger"
        size="md"
        onClick={handleConfirm}
        loading={loading}
        disabled={!isValid || loading}
      >
        {confirmLabel}
      </Button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      variant="premium"
      title={title}
      description={description}
      closeOnOverlay={!loading}
      footer={footer}
      icon={
        <span className={styles.iconWrapper} aria-hidden="true">
          <AlertTriangle size={22} strokeWidth={2} />
        </span>
      }
    >
      <div className={styles.body}>
        {referenceLabel && (
          <div className={styles.referenceRow}>
            <span className={styles.referenceLabel}>{referenceLabel}</span>
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor={reasonId} className={styles.label}>
            {reasonLabel}
            <span className={styles.required} aria-hidden="true">
              {' '}
              *
            </span>
          </label>
          <textarea
            id={reasonId}
            ref={textareaRef}
            className={cn(styles.textarea, tooShort && styles.textareaError)}
            placeholder={reasonPlaceholder}
            value={reason}
            maxLength={maxLength}
            rows={4}
            onChange={(e) => setReason(e.target.value)}
            aria-required="true"
            aria-invalid={tooShort}
            aria-describedby={cn(counterId, tooShort ? errorId : '')}
          />
          <div className={styles.metaRow}>
            {tooShort ? (
              <span id={errorId} className={styles.errorText} role="alert">
                El motivo debe tener al menos {minLength} caracteres.
              </span>
            ) : (
              <span className={styles.helpText}>{helpText}</span>
            )}
            <span id={counterId} className={styles.counter} aria-live="polite">
              {reason.length} / {maxLength}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
