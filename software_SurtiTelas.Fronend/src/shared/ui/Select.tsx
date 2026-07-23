import { forwardRef, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full h-10 pl-4 pr-10 rounded-xl border text-sm appearance-none transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              error ? 'border-red-400' : '',
              className
            )}
            style={{
              background: 'var(--input-bg)',
              borderColor: error ? 'var(--color-error)' : 'var(--input-border)',
              color: 'var(--input-text)',
            }}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
        </div>
        {error && <p className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';