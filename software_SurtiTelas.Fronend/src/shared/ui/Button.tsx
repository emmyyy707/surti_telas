import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils';
import {
  Tooltip,
  type TooltipPlacement,
  type TooltipTrigger,
} from '@/shared/components/Tooltip';
import s from './Button.module.css';

const buttonVariants = cva(s.button, {
  variants: {
    variant: {
      primary: 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] border border-[var(--btn-primary-border)] hover:bg-[var(--btn-primary-bg-hover)] hover:border-[var(--btn-primary-bg-hover)] focus-visible:ring-[var(--btn-primary-focus-ring)] active:bg-[var(--btn-primary-bg-active)] active:border-[var(--btn-primary-bg-active)] shadow-sm',
      secondary: 'bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] border border-[var(--btn-secondary-border)] hover:bg-[var(--btn-secondary-bg-hover)] hover:border-[var(--btn-secondary-hover-border)] active:bg-[var(--btn-secondary-bg-hover)] focus-visible:ring-[var(--btn-primary-focus-ring)]',
      outline: 'bg-[var(--btn-outline-bg)] text-[var(--btn-outline-text)] border border-[var(--btn-outline-border)] hover:bg-[var(--btn-outline-bg-hover)] hover:border-[var(--btn-outline-border)] hover:text-[var(--btn-outline-hover-text)] active:bg-[var(--btn-outline-bg-hover)] focus-visible:ring-[var(--btn-primary-focus-ring)]',
      ghost: 'bg-[var(--btn-ghost-bg)] text-[var(--btn-ghost-text)] hover:bg-[var(--btn-ghost-bg-hover)] hover:text-[var(--btn-ghost-hover-text)] focus-visible:ring-[var(--btn-primary-focus-ring)] active:bg-[var(--btn-ghost-bg-hover)]',
      danger: 'bg-[var(--btn-danger-bg)] text-[var(--btn-danger-text)] border border-[var(--btn-danger-bg)] hover:bg-[var(--btn-danger-bg-hover)] hover:border-[var(--btn-danger-bg-hover)] focus-visible:ring-[rgba(248,113,113,0.3)] active:bg-[var(--btn-danger-bg-hover)] shadow-sm',
      success: 'bg-[var(--btn-success-bg)] text-[var(--btn-success-text)] border border-[var(--btn-success-bg)] hover:bg-[var(--btn-success-bg-hover)] hover:border-[var(--btn-success-bg-hover)] focus-visible:ring-[rgba(74,222,128,0.3)] active:bg-[var(--btn-success-bg-hover)] shadow-sm',
      warning: 'bg-[var(--btn-warning-bg)] text-[var(--btn-warning-text)] border border-[var(--btn-warning-bg)] hover:bg-[var(--btn-warning-bg-hover)] hover:border-[var(--btn-warning-bg-hover)] focus-visible:ring-[rgba(252,211,77,0.3)] active:bg-[var(--btn-warning-bg-hover)] shadow-sm',
    },
    size: {
      xs: s.buttonSizeXs,
      sm: s.buttonSizeSm,
      md: s.buttonSizeMd,
      lg: s.buttonSizeLg,
      xl: s.buttonSizeXl,
      icon: s.buttonIcon,
      'icon-sm': s.buttonIconSm,
      'icon-xs': s.buttonIconXs,
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

const sizeClassMap: Record<string, string> = {
  xs: s.buttonSizeXs,
  sm: s.buttonSizeSm,
  md: s.buttonSizeMd,
  lg: s.buttonSizeLg,
  xl: s.buttonSizeXl,
  icon: s.buttonIcon,
  'icon-sm': s.buttonIconSm,
  'icon-xs': s.buttonIconXs,
};

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  tooltip?: string;
  tooltipPlacement?: TooltipPlacement;
  tooltipTrigger?: TooltipTrigger;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      tooltip,
      tooltipPlacement,
      tooltipTrigger,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const sizeClass = size ? sizeClassMap[size] : s.buttonSizeMd;

    const buttonContent = (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), sizeClass, className)}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        <span className={s.buttonContent}>
          {loading ? (
            <Loader2 className={s.buttonSpinner} />
          ) : leftIcon ? (
            <span className={s.buttonIcon}>{leftIcon}</span>
          ) : null}
          <span className={s.buttonContentText}>{children}</span>
          {!loading && rightIcon ? (
            <span className={s.buttonIcon}>{rightIcon}</span>
          ) : null}
        </span>
      </button>
    );

    if (!tooltip) return buttonContent;

    return (
      <Tooltip title={tooltip} placement={tooltipPlacement} trigger={tooltipTrigger}>
        {buttonContent}
      </Tooltip>
    );
  }
);

Button.displayName = 'Button';
