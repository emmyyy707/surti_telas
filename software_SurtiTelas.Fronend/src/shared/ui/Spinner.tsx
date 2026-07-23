import { cn } from '@/shared/utils';

interface SpinnerProps { size?: 'sm' | 'md' | 'lg'; className?: string; }

export const Spinner = ({ size = 'md', className }: SpinnerProps) => {
  const sizeMap = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <div className={cn('animate-spin rounded-full border-2 border-slate-200 dark:border-zinc-700 border-t-slate-900 dark:border-t-white', sizeMap[size], className)} />
  );
};



