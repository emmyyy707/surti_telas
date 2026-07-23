import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils';
import {
  Tooltip,
  type TooltipPlacement,
  type TooltipTrigger,
} from '@/shared/components/Tooltip';

const btn = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none shrink-0',
  {
    variants: {
      variant: {
        primary:   'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border border-[var(--btn-primary-border)] hover:bg-[var(--btn-primary-bg-hover)] focus-visible:ring-[var(--btn-primary-bg)]',
        secondary: 'bg-transparent text-[var(--btn-secondary-text)] border border-[var(--btn-secondary-border)] hover:bg-[var(--btn-secondary-bg-hover)]',
        outline:   'border border-[var(--btn-secondary-border)] bg-transparent text-[var(--btn-secondary-text)] hover:bg-[var(--btn-secondary-bg-hover)] hover:border-[var(--btn-secondary-border)]',
        ghost:     'bg-transparent text-[var(--btn-ghost-text)] hover:bg-[var(--btn-ghost-bg-hover)] hover:text-[var(--color-text-primary)]',
        danger:    'bg-[var(--btn-danger-bg)] text-[var(--btn-danger-text)] border border-[var(--btn-danger-border)] hover:bg-[var(--btn-danger-bg-hover)] focus-visible:ring-[var(--btn-danger-bg)]',
        success:   'bg-[var(--btn-success-bg)] text-[var(--btn-success-text)] border border-[var(--btn-success-bg)] hover:bg-[var(--btn-success-bg-hover)] focus-visible:ring-[var(--btn-success-bg)]',
        warning:   'bg-[var(--btn-warning-bg)] text-[var(--btn-warning-text)] border border-[var(--btn-warning-bg)] hover:bg-[var(--btn-warning-bg-hover)] focus-visible:ring-[var(--btn-warning-bg)]',
      },
      size: {
        xs:      'h-7 px-2.5 text-[11px] rounded-lg',
        sm:      'h-8 px-3 text-[12px] rounded-lg',
        md:      'h-9 px-3.5 text-[13px] rounded-xl',
        lg:      'h-11 px-5 text-[14px] rounded-xl',
        xl:      'h-12 px-6 text-[15px] rounded-2xl',
        icon:    'h-9 w-9 rounded-xl',
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
  tooltip?: string;
  tooltipPlacement?: TooltipPlacement;
  tooltipTrigger?: TooltipTrigger;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, tooltip, tooltipPlacement, tooltipTrigger, ...props }, ref) => {
    const button = (
      <button ref={ref} className={cn(btn({ variant, size }), className)} disabled={disabled || loading} {...props}>
        {loading ? <Loader2 size={13} className="animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );

    if (tooltip) {
      return (
        <Tooltip title={tooltip} placement={tooltipPlacement} trigger={tooltipTrigger}>
          {button}
        </Tooltip>
      );
    }

    return button;
  }
);
Button.displayName = 'Button';



