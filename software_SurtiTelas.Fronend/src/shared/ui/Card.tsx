import { ReactNode } from 'react';
import { cn } from '@/shared/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card = ({ children, className, padding = 'md', hover = false }: CardProps) => {
  const padMap = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };
  return (
    <div className={cn(
      'rounded-2xl border shadow-sm',
      'bg-[var(--color-bg-card)] border-[var(--color-border)]',
      hover && 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
      padMap[padding],
      className
    )}>
      {children}
    </div>
  );
};



