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
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none select-none shrink-0',
  {
    variants: {
      variant: {
         primary:   'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border border-[var(--btn-primary-border)] hover:bg-[var(--btn-primary-bg-hover)] hover:border-[var(--btn-primary-bg-hover)] hover:transform hover:-translate-y-px active:bg-[var(--btn-primary-bg-active)] active:border-[var(--btn-primary-bg-active)] active:transform-none focus-visible:ring-[var(--btn-primary-focus-ring)] shadow-sm',
         secondary: 'bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] border border-[var(--btn-secondary-border)] hover:bg-[var(--btn-secondary-bg-hover)] hover:border-[var(--btn-secondary-hover-border)] active:bg-[var(--btn-secondary-bg-hover)] focus-visible:ring-[var(--btn-primary-focus-ring)]',
         outline:   'bg-[var(--btn-outline-bg)] text-[var(--btn-outline-text)] border border-[var(--btn-outline-border)] hover:bg-[var(--btn-outline-bg-hover)] hover:border-[var(--btn-primary-border)] hover:text-[var(--btn-outline-hover-text)] active:bg-[var(--btn-outline-bg-hover)] focus-visible:ring-[var(--btn-primary-focus-ring)]',
         ghost:     'bg-[var(--btn-ghost-bg)] text-[var(--btn-ghost-text)] hover:bg-[var(--btn-ghost-bg-hover)] hover:text-[var(--btn-ghost-hover-text)] focus-visible:ring-[var(--btn-primary-focus-ring)]',
         danger:    'bg-[var(--btn-danger-bg)] text-[var(--btn-danger-text)] border border-[var(--btn-danger-bg)] hover:bg-[var(--btn-danger-bg-hover)] hover:border-[var(--btn-danger-bg-hover)] hover:transform hover:-translate-y-px active:transform-none focus-visible:ring-[rgba(248,113,113,0.3)] shadow-sm',
         success:   'bg-[var(--btn-success-bg)] text-[var(--btn-success-text)] border border-[var(--btn-success-bg)] hover:bg-[var(--btn-success-bg-hover)] hover:border-[var(--btn-success-bg-hover)] hover:transform hover:-translate-y-px active:transform-none focus-visible:ring-[rgba(74,222,128,0.3)] shadow-sm',
         warning:   'bg-[var(--btn-warning-bg)] text-[var(--btn-warning-text)] border border-[var(--btn-warning-bg)] hover:bg-[var(--btn-warning-bg-hover)] hover:border-[var(--btn-warning-bg-hover)] hover:transform hover:-translate-y-px active:transform-none focus-visible:ring-[rgba(252,211,77,0.3)] shadow-sm',
      },
      size: {
         xs:      'min-h-[32px] px-2.5 text-[11px] rounded-md',
         sm:      'min-h-[36px] px-3.5 text-[12px] rounded-lg',
         md:      'min-h-[40px] px-4 text-[13px] rounded-lg',
         lg:      'min-h-[44px] px-5 text-[14px] rounded-lg',
         xl:      'min-h-[48px] px-6 text-[15px] rounded-xl',
         icon:    'h-9 w-9 rounded-lg',
         'icon-sm': 'h-8 w-8 rounded-md',
         'icon-xs': 'h-7 w-7 rounded-md',
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
        {loading ? <Loader2 size={14} className="animate-spin" /> : leftIcon}
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



