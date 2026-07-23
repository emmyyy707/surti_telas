import { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { Badge } from './Badge';
import { BaseModal, type BaseModalProps } from './Modal';

export interface InfoModalProps extends Omit<BaseModalProps, 'icon'> {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  sections?: Array<{ label: string; value: ReactNode }>;
  badge?: ReactNode;
  size?: BaseModalProps['size'];
}

export const InfoModal = ({ open, onClose, title, description, sections, badge, size = 'md', children }: InfoModalProps) => (
  <BaseModal
    open={open}
    onClose={onClose}
    title={title}
    description={description}
    icon={<Info size={18} />}
    badge={badge ?? <Badge variant="info">Información</Badge>}
    size={size}
    footer={
      <button
        type="button"
        className="inline-flex h-9 items-center justify-center rounded-xl border border-[var(--color-border)] bg-transparent px-4 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-elevated)]"
        onClick={onClose}
      >
        Cerrar
      </button>
    }
  >
    {sections && sections.length > 0 ? (
      <div className="grid gap-3">
        {sections.map((item) => (
          <div key={item.label} className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">{item.label}</p>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.value}</p>
          </div>
        ))}
      </div>
    ) : (
      children
    )}
  </BaseModal>
);
