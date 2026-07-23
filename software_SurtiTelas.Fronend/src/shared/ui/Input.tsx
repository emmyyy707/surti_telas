import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/shared/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-[12px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'erp-input',
              error && 'border-red-400 focus:ring-red-500/20',
              leftIcon  && 'pl-9',
              rightIcon && 'pr-9',
              className
            )}
            style={{
              background: 'var(--input-bg, var(--color-bg-elevated))',
              borderColor: error ? 'var(--color-error)' : 'var(--input-border, var(--color-border))',
              color: 'var(--input-text, var(--color-text-primary))',
            }}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3" style={{ color: 'var(--color-text-muted)' }}>
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-[11px]" style={{ color: 'var(--color-error)' }}>{error}</p>}
        {hint && !error && <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';



