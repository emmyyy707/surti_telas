import { ReactNode } from 'react';
import { cn } from '@/shared/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  iconColor?: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  loading?: boolean;
}

export const StatsCard = ({
  title, value, change, changeLabel, icon, iconColor = 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400',
  prefix, suffix, className, loading
}: StatsCardProps) => {
  const isPositive = change != null && change > 0;
  const isNegative = change != null && change < 0;

  if (loading) {
    return (
      <div className={cn('bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-3', className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/2" />
          <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded w-2/3" />
          <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 hover:shadow-md transition-all duration-200', className)}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">{title}</p>
        {icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconColor)}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
        {prefix}<span>{value}</span>{suffix}
      </p>
      {change != null && (
        <div className="flex items-center gap-1.5 mt-2">
          {isPositive && <TrendingUp size={14} className="text-emerald-500" />}
          {isNegative && <TrendingDown size={14} className="text-red-500" />}
          {!isPositive && !isNegative && <Minus size={14} className="text-slate-400" />}
          <span className={cn('text-xs font-medium', isPositive ? 'text-emerald-600 dark:text-emerald-400' : isNegative ? 'text-red-600 dark:text-red-400' : 'text-slate-500')}>
            {isPositive ? '+' : ''}{change}%
          </span>
          {changeLabel && <span className="text-xs text-slate-400 dark:text-zinc-500">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
};



