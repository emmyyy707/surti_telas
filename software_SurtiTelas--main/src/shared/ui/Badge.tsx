import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300',
        primary: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900',
        success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        outline: 'border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge = ({ variant, children, className, dot }: BadgeProps) => (
  <span className={cn(badgeVariants({ variant }), className)}>
    {dot && (
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        variant === 'success' && 'bg-emerald-500',
        variant === 'warning' && 'bg-amber-500',
        variant === 'danger' && 'bg-red-500',
        variant === 'info' && 'bg-blue-500',
        variant === 'purple' && 'bg-purple-500',
        (!variant || variant === 'default') && 'bg-slate-500',
      )} />
    )}
    {children}
  </span>
);



