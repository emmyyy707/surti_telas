import { ReactNode } from 'react';
import { cn } from '@/shared/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => (
  <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
    {icon && (
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400 dark:text-zinc-500 mb-4">
        {icon}
      </div>
    )}
    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm mb-6">{description}</p>}
    {action}
  </div>
);



