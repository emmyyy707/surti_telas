import React, { useState } from 'react';

export interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  styles: Record<string, string>;
}

export const CollapsibleSection = ({ title, children, defaultOpen = false, styles }: CollapsibleSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.distributionSection}>
      <div className={styles.distributionHeader}>
        <h3 className={styles.distributionTitle}>{title}</h3>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={styles.quotationAddLine}
          aria-expanded={open}
        >
          {open ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
      {open && children}
    </div>
  );
};
