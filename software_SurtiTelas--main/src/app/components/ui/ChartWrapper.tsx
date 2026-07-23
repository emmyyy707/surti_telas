import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

interface ChartWrapperProps {
  data: any[];
  type: 'pie' | 'bar' | 'line' | 'area';
  dataKey: string;
  colors?: string[];
  height?: number;
  showTooltip?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  xAxisDataKey?: string;
  loading?: boolean;
  emptyMessage?: string;
}

export function ChartWrapper({
  data,
  type,
  dataKey,
  colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#6b7280'],
  height = 300,
  showTooltip = true,
  showLegend = false,
  showGrid = true,
  xAxisDataKey,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
}: ChartWrapperProps) {
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter((item) => item && (item[dataKey] !== undefined || item.value !== undefined));
  }, [data, dataKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="animate-pulse text-gray-500">Cargando gráfico...</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={dataKey}
              isAnimationActive={false}
            >
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} />
              ))}
            </Pie>
            {showTooltip && <Tooltip />}
          </PieChart>
        );
      case 'bar':
        return (
          <BarChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />}
            {xAxisDataKey && <XAxis dataKey={xAxisDataKey} stroke="var(--text-tertiary)" />}
            <YAxis stroke="var(--text-tertiary)" />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Bar dataKey={dataKey} fill={colors[0]} isAnimationActive={false} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />}
            {xAxisDataKey && <XAxis dataKey={xAxisDataKey} stroke="var(--text-tertiary)" />}
            <YAxis stroke="var(--text-tertiary)" />
            {showTooltip && <Tooltip />}
            <Line type="monotone" dataKey={dataKey} stroke={colors[0]} strokeWidth={2} isAnimationActive={false} />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={chartData}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />}
            {xAxisDataKey && <XAxis dataKey={xAxisDataKey} stroke="var(--text-tertiary)" />}
            <YAxis stroke="var(--text-tertiary)" />
            {showTooltip && <Tooltip />}
            <Area type="monotone" dataKey={dataKey} stroke={colors[0]} fill={colors[0]} fillOpacity={0.3} isAnimationActive={false} />
          </AreaChart>
        );
      default:
        return null;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      {renderChart()}
    </ResponsiveContainer>
  );
}

