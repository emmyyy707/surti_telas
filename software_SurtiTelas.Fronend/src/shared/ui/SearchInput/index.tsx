import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/shared/utils';
import s from './SearchInput.module.css';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  onSearch?: (value: string) => void;
  debounceMs?: number;
  minChars?: number;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onSearch, debounceMs = 150, minChars = 1, placeholder = 'Buscar...', value, onChange, ...props }, ref) => {
    const [localValue, setLocalValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const timerRef = { current: 0 };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setLocalValue(next);

      if (onSearch) {
        clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
          if (next.length >= minChars || next.length === 0) {
            onSearch(next);
          }
        }, debounceMs);
      }

      onChange?.(e);
    };

    const handleClear = () => {
      const next = '';
      setLocalValue(next);
      if (onSearch) onSearch('');
      onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        handleClear();
        (e.target as HTMLInputElement).blur();
      }
      props.onKeyDown?.(e);
    };

    const inputValue = value !== undefined ? String(value) : localValue;
    const showClear = inputValue.length > 0;

    return (
      <div
        className={cn(
          s.wrapper,
          isFocused && s.wrapperFocused,
          props.disabled && s.wrapperDisabled,
          className
        )}
      >
        <Search size={15} className={s.icon} aria-hidden="true" focusable="false" />
        <input
          ref={ref}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={e => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={e => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          placeholder={placeholder}
          className={s.input}
          {...props}
        />
        {showClear && (
          <button
            type="button"
            onClick={handleClear}
            className={s.clearButton}
            aria-label="Limpiar búsqueda"
            tabIndex={-1}
          >
            <X size={13} />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
