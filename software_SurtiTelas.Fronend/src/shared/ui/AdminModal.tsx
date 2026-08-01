import React, { useId, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import m from './AdminModal.module.css';

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const sizeClass: Record<string, string> = {
  sm: 'adminModalSm',
  md: 'adminModalMd',
  lg: 'adminModalLg',
  xl: 'adminModalXl',
};

export const AdminModal: React.FC<AdminModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
}) => {
  const titleId = `admin-modal-title-${useId()}`;
  const descId = `${titleId}-desc`;
  const overlayRef = useRef<HTMLDivElement>(null);
  const sizeCls = sizeClass[size] ?? '';

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose, closeOnEscape]);

  if (!open) return null;

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) onClose();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div ref={overlayRef} className={m.modalOverlay} onClick={handleOverlayClick}>
      <div
        className={m.modal + (sizeCls ? ' ' + m[sizeCls] : '')}
        onClick={handleModalClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
      >
        <div className={m.modalHeader}>
          <div className={m.headerText}>
            <h2 id={titleId} className={m.modalTitle}>{title}</h2>
            {description && (
              <p id={descId} className={m.modalDescription}>{description}</p>
            )}
          </div>
          <button
            type="button"
            className={m.closeBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>
        <div className={m.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );
};

AdminModal.displayName = 'AdminModal';
