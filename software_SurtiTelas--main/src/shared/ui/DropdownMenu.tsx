import { ReactNode, useState, useRef, useEffect } from 'react';
import { cn } from '@/shared/utils';

interface DropdownDivider {
  divider: true;
  label?: never;
  icon?: never;
  onClick?: never;
  danger?: never;
  disabled?: never;
}

interface DropdownAction {
  divider?: false;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
}

type DropdownItem = DropdownAction | DropdownDivider;

interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const DropdownMenu = ({ trigger, items, align = 'right', className }: DropdownMenuProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && (
        <div className={cn(
          'absolute top-full mt-2 z-50 min-w-[180px] bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xl py-1 animate-in fade-in zoom-in-95 duration-150',
          align === 'right' ? 'right-0' : 'left-0'
        )}>
          {items.map((item, i) => (
            item.divider
              ? <div key={i} className="my-1 border-t border-slate-100 dark:border-zinc-800" />
              : (
                <button
                  key={i}
                  onClick={() => { item.onClick?.(); setOpen(false); }}
                  disabled={item.disabled}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                    item.danger
                      ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800',
                    item.disabled && 'opacity-50 pointer-events-none'
                  )}
                >
                  {item.icon && <span className="text-slate-400 dark:text-zinc-500">{item.icon}</span>}
                  {item.label}
                </button>
              )
          ))}
        </div>
      )}
    </div>
  );
};



