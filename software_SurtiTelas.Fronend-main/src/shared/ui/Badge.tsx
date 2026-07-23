import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none transition-all duration-200 select-none whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]',
        primary: 'border border-indigo-500/40 bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
        success: 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
        warning: 'border border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300',
        danger: 'border border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300',
        info: 'border border-blue-500/40 bg-blue-500/15 text-blue-700 dark:text-blue-300',
        purple: 'border border-purple-500/40 bg-purple-500/15 text-purple-700 dark:text-purple-300',
        outline: 'border border-[var(--color-border)] bg-transparent text-[var(--color-text-secondary)]',
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
        'h-1.5 w-1.5 rounded-full shadow-[0_0_0_2px_rgba(255,255,255,0.7)]',
        variant === 'success' && 'bg-emerald-500',
        variant === 'warning' && 'bg-amber-500',
        variant === 'danger' && 'bg-red-500',
        variant === 'info' && 'bg-blue-500',
        variant === 'purple' && 'bg-purple-500',
        variant === 'primary' && 'bg-indigo-500',
        (!variant || variant === 'default') && 'bg-[var(--color-text-muted)]',
      )} />
    )}
    {children}
  </span>
);
