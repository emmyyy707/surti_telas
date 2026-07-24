import { AlertTriangle, CheckCircle2, Info, type LucideIcon } from 'lucide-react';
import { Button } from './Button';

type ConfirmationVariant = 'default' | 'danger' | 'success';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmationVariant;
  icon?: LucideIcon;
  loading?: boolean;
}

const iconMap: Record<ConfirmationVariant, LucideIcon> = {
  default: Info,
  danger: AlertTriangle,
  success: CheckCircle2,
};

export const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  icon,
  loading = false,
}: ConfirmationModalProps) => {
  if (!open) return null;

  const Icon = icon ?? iconMap[variant];

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-[var(--modal-overlay)] p-4 backdrop-blur-md"
      role="presentation"
    >
      <section
        className="w-full max-w-md animate-in fade-in zoom-in-95 slide-in-from-bottom-2 rounded-[24px] border border-[var(--color-border)] bg-[var(--modal-bg)] p-6 shadow-[var(--shadow-modal)] max-[640px]:max-h-[calc(100dvh-24px)] max-[640px]:overflow-y-auto max-[640px]:w-[calc(100vw-24px)] max-[640px]:rounded-[20px] max-[640px]:p-5"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-5 flex items-start gap-4 max-[640px]:mb-4 max-[640px]:gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]">
            <Icon size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h2>
            {description && <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 max-[640px]:flex-col-reverse">
          <Button type="button" variant="secondary" onClick={onClose} className="max-[640px]:w-full">
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'danger' : variant === 'success' ? 'success' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            className="max-[640px]:w-full"
          >
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
};
