import { useState, ReactNode } from 'react';
import { cn } from '@/shared/utils';

interface Tab { id: string; label: string; icon?: ReactNode; badge?: number; }
interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  children?: (activeTab: string) => ReactNode;
  className?: string;
}

export const Tabs = ({ tabs, defaultTab, onChange, children, className }: TabsProps) => {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);

  const handleChange = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              active === tab.id
                ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.badge != null && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      {children?.(active)}
    </div>
  );
};



