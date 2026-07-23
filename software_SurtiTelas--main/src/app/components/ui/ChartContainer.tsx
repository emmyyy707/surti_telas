import { ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';

interface ChartContainerProps {
  data: any[];
  children: ReactNode;
  height?: number;
  loading?: boolean;
  emptyMessage?: string;
}

export function ChartContainer({
  data,
  children,
  height = 300,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
}: ChartContainerProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-pulse text-gray-500">Cargando gráfico...</div>
      </div>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      {children as React.ReactElement}
    </ResponsiveContainer>
  );
}

