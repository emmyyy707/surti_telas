import {
  AlertTriangle,
  CheckCircle2,
  Info,
  type LucideIcon,
} from 'lucide-react';
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

const variantIconStyles: Record<ConfirmationVariant, string> = {
  default:
    'bg-zinc-100 text-zinc-700 border-zinc-200',
  danger:
    'bg-red-50 text-red-600 border-red-100',
  success:
    'bg-emerald-50 text-emerald-600 border-emerald-100',
};

const buttonVariantMap: Record<
  ConfirmationVariant,
  'primary' | 'danger' | 'success'
> = {
  default: 'primary',
  danger: 'danger',
  success: 'success',
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
      className="
        fixed inset-0 z-[1000]
        flex items-center justify-center
        bg-black/50
        p-4
        backdrop-blur-sm
        animate-in fade-in duration-200
      "
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <section
        className="
          w-full max-w-md
          overflow-hidden
          rounded-2xl
          border border-zinc-200
          bg-white
          shadow-[0_24px_70px_rgba(0,0,0,0.20)]
          animate-in
          fade-in
          zoom-in-95
          slide-in-from-bottom-2
          duration-200
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        aria-describedby={
          description ? 'confirmation-modal-description' : undefined
        }
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* CONTENIDO */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-start gap-4">
            {/* ICONO */}
            <div
              className={`
                flex
                h-12 w-12
                shrink-0
                items-center justify-center
                rounded-xl
                border
                ${variantIconStyles[variant]}
              `}
              aria-hidden="true"
            >
              <Icon size={22} strokeWidth={2} />
            </div>

            {/* TEXTO */}
            <div className="min-w-0 flex-1 pt-0.5">
              <h2
                id="confirmation-modal-title"
                className="
                  text-lg
                  font-semibold
                  leading-6
                  tracking-tight
                  text-zinc-900
                "
              >
                {title}
              </h2>

              {description && (
                <p
                  id="confirmation-modal-description"
                  className="
                    mt-2
                    text-sm
                    leading-5
                    text-zinc-500
                  "
                >
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ACCIONES */}
        <div
          className="
            flex
            items-center
            justify-end
            gap-3
            border-t
            border-zinc-100
            bg-zinc-50/60
            px-6
            py-4
          "
        >
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={loading}
            className="
              justify-center
              whitespace-nowrap
            "
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant={buttonVariantMap[variant]}
            size="md"
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
            className="
              justify-center
              whitespace-nowrap
            "
          >
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
};