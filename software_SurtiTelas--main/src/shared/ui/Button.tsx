import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils';

const btn = cva(
  'inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45 select-none shrink-0',
  {
    variants: {
      variant: {
        primary:   'bg-[var(--text-primary)] text-[var(--text-inverse)] hover:opacity-85 focus-visible:ring-[var(--border-focus)]',
        secondary: 'bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)] border border-[var(--border-default)] focus-visible:ring-[var(--border-focus)]',
        outline:   'border border-[var(--border-default)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:border-[var(--border-strong)] focus-visible:ring-[var(--border-focus)]',
        ghost:     'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
        danger:    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
        success:   'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500',
        warning:   'bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500',
      },
      size: {
        xs:      'h-6 px-2.5 text-[11px] rounded-lg',
        sm:      'h-7 px-3 text-[12px] rounded-lg',
        md:      'h-8 px-3.5 text-[12.5px] rounded-xl',
        lg:      'h-10 px-5 text-[13px] rounded-xl',
        xl:      'h-12 px-6 text-[14px] rounded-2xl',
        icon:    'h-8 w-8 rounded-xl',
        'icon-sm': 'h-7 w-7 rounded-lg',
        'icon-xs': 'h-6 w-6 rounded-md',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof btn> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => (
    <button ref={ref} className={cn(btn({ variant, size }), className)} disabled={disabled || loading} {...props}>
      {loading ? <Loader2 size={13} className="animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
);
Button.displayName = 'Button';



