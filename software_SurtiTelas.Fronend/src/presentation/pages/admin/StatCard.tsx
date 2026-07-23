import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import s from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  Icon: React.ElementType;
  color?: 'accent' | 'success' | 'info' | 'warning';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  trendUp = true,
  Icon,
  color = 'accent',
}) => {
  const iconColorClass = {
    accent: s.statCardIconAccent,
    success: s.statCardIconSuccess,
    info: s.statCardIconInfo,
    warning: s.statCardIconWarning,
  }[color];

  return (
    <div className={s.statCard}>
      <div className={s.statCardTop}>
        <div className={`${s.statCardIcon} ${iconColorClass}`}>
          <Icon size={22} />
        </div>
        {trend && (
          <div className={`${s.statCardTrend} ${trendUp ? s.statCardTrendUp : s.statCardTrendDown}`}>
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </div>
        )}
      </div>
      <div className={s.statCardValue}>{value}</div>
      <div className={s.statCardLabel}>{label}</div>
    </div>
  );
};