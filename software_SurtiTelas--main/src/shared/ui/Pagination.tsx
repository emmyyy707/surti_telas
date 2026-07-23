import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/shared/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  className?: string;
}

export const Pagination = ({ page, totalPages, onPageChange, totalItems, pageSize, className }: PaginationProps) => {
  const from = totalItems ? (page - 1) * (pageSize || 10) + 1 : null;
  const to = totalItems ? Math.min(page * (pageSize || 10), totalItems) : null;

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });

  return (
    <div className={cn('flex items-center justify-between gap-4 flex-wrap', className)}>
      {totalItems != null && (
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Mostrando <span className="font-medium text-slate-900 dark:text-white">{from}-{to}</span> de{' '}
          <span className="font-medium text-slate-900 dark:text-white">{totalItems}</span> resultados
        </p>
      )}
      <div className="flex items-center gap-1 ml-auto">
        <Button variant="outline" size="icon-sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
          <ChevronLeft size={14} />
        </Button>
        {pages.map((p) => (
          <Button
            key={p}
            size="icon-sm"
            variant={p === page ? 'primary' : 'outline'}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}
        <Button variant="outline" size="icon-sm" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
};



