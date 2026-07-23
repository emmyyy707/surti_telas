import React from 'react';
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  LineChart as ReLineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

import s from './Chart.module.css';

/* ========================================= */

const COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#f59e0b',
  '#10b981',
  '#94a3b8',
];

const TOOLTIP_CONTENT_STYLE = {
  background: 'var(--color-bg-elevated)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '10px 14px',
  color: 'var(--color-text-primary)',
  fontSize: '0.82rem',
  lineHeight: 1.4,
};

const TOOLTIP_ITEM_STYLE = {
  color: 'var(--color-text-secondary)',
};

/* ========================================= */

interface ChartWrapperProps {
  title?: string;
  children: React.ReactNode;
}

function ChartWrapper({
  title,
  children,
}: ChartWrapperProps) {
  const description = title ? `Gráfico: ${title}` : 'Gráfico';
  return (
    <div className={s.chartContainer}>
      {title && (
        <h4 className={s.chartTitle}>
          {title}
        </h4>
      )}

      <div role="img" aria-label={description} style={{ width: '100%', height: 300 }}>
        {children}
      </div>
    </div>
  );
}

/* ========================================= */
/* BAR CHART */
/* ========================================= */

interface BarChartProps {
  data: {
    label: string;
    value: number;
  }[];

  title?: string;
}

export function BarChart({
  data,
  title,
}: BarChartProps) {
  return (
    <ChartWrapper title={title}>
      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <ReBarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-subtle)"
          />

          <XAxis
            dataKey="label"
            stroke="var(--color-text-muted)"
            tick={{ fontSize: 11 }}
          />

          <YAxis
            stroke="var(--color-text-muted)"
            tick={{ fontSize: 11 }}
          />

          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            contentStyle={TOOLTIP_CONTENT_STYLE}
            itemStyle={TOOLTIP_ITEM_STYLE}
          />

          <Bar
            dataKey="value"
            radius={[8, 8, 0, 0]}
            fill="#10b981"
          />
        </ReBarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

/* ========================================= */
/* LINE CHART */
/* ========================================= */

interface LineChartProps {
  data: {
    label: string;
    value: number;
  }[];

  title?: string;
}

export function LineChart({
  data,
  title,
}: LineChartProps) {
  return (
    <ChartWrapper title={title}>
      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <ReLineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-subtle)"
          />

          <XAxis
            dataKey="label"
            stroke="var(--color-text-muted)"
            tick={{ fontSize: 11 }}
          />

          <YAxis
            stroke="var(--color-text-muted)"
            tick={{ fontSize: 11 }}
          />

          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            itemStyle={TOOLTIP_ITEM_STYLE}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#111827"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </ReLineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

/* ========================================= */
/* PIE CHART */
/* ========================================= */

interface PieChartProps {
  data: {
    label: string;
    value: number;
    color?: string;
  }[];

  title?: string;
}

export function PieChart({
  data,
  title,
}: PieChartProps) {
  return (
    <ChartWrapper title={title}>
      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <RePieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={60}
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.color ||
                  COLORS[
                    index % COLORS.length
                  ]
                }
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            itemStyle={TOOLTIP_ITEM_STYLE}
          />
        </RePieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

/* ========================================= */
/* TOP PRODUCTS */
/* ========================================= */

interface TopProductsProps {
  data: {
    rank: number;
    name: string;
    sales: string;
  }[];

  title?: string;
}

export function TopProducts({
  data,
  title,
}: TopProductsProps) {
  return (
    <ChartWrapper title={title}>
      <div className={s.topProducts}>
        {data.map(item => (
          <div
            key={item.rank}
            className={s.productItem}
          >
            <span className={s.rank}>
              {item.rank}
            </span>

            <span className={s.productName}>
              {item.name}
            </span>

            <span className={s.sales}>
              {item.sales}
            </span>
          </div>
        ))}
      </div>
    </ChartWrapper>
  );
}

