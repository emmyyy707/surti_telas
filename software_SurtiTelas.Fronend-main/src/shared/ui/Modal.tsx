import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils';
import { Button } from './Button';
import styles from '@/styles/Modal.module.css';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ModalVariant = 'default' | 'premium' | 'form';

export interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  variant?: ModalVariant;
  icon?: ReactNode;
  badge?: ReactNode;
  meta?: ReactNode;
  headerActions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  footerClassName?: string;
  closeOnOverlay?: boolean;
}


export const BaseModal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  variant = 'premium',
  icon,
  badge,
  meta,
  headerActions,
  className,
  bodyClassName,
  footerClassName,
  closeOnOverlay = false,
}: BaseModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Apply dashboard scoped theme to the portaled modal so it matches admin dark mode
  useEffect(() => {
    const applyTheme = (value?: string | null) => {
      try {
        const val = value ?? window.localStorage.getItem('dashboard-theme') ?? 'light';
        if (overlayRef.current) overlayRef.current.setAttribute('data-theme', val);
      } catch (_e) {
        // ignore
      }
    };

    if (open) applyTheme();

    const handler = (e: Event) => {
      // event detail is the theme string
      const theme = (e as CustomEvent).detail as string | undefined;
      applyTheme(theme);
    };

    window.addEventListener('dashboard-theme-changed', handler as EventListener);
    return () => window.removeEventListener('dashboard-theme-changed', handler as EventListener);
  }, [open]);

  if (!open) return null;

  const modal = (
    <div
      ref={overlayRef}
      onClick={(e) => closeOnOverlay && e.target === overlayRef.current && onClose()}
      className={cn(styles.overlay, styles[`overlay--${variant}`])}
      role="presentation"
    >
      <section
        className={cn(
          styles.modal,
          styles[`modal--${variant}`],
          styles[`modal--${size}`],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Modal'}
      >
        <header className={styles.modalHeader}>
          <div className={styles.headerContent}>
            {icon && <div className={styles.headerIcon}>{icon}</div>}
            <div className={styles.headerText}>
              <div className={styles.titleRow}>
                <h2 className={styles.modalTitle}>{title}</h2>
                {badge && <div className={styles.headerBadge}>{badge}</div>}
              </div>
              {(description || meta) && (
                <p className={styles.modalDescription}>
                  {description}
                  {description && meta && <span className={styles.metaSeparator}>•</span>}
                  {meta}
                </p>
              )}
            </div>
          </div>
          <div className={styles.headerActions}>
            {headerActions}
            <Button variant="ghost" size="icon-sm" onClick={onClose} className={styles.closeButton} aria-label="Cerrar">
              <X size={16} />
            </Button>
          </div>
        </header>

        <div className={cn(styles.modalBody, bodyClassName)}>{children}</div>

        {footer && (
          <footer className={cn(styles.modalFooter, footerClassName)}>
            {footer}
          </footer>
        )}
      </section>
    </div>
  );

  return createPortal(modal, document.body);
};

export const Modal = (props: BaseModalProps) => <BaseModal {...props} />;
