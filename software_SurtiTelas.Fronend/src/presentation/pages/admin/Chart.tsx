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
  'var(--chart-series-1)',
  'var(--chart-series-2)',
  'var(--chart-series-3)',
  'var(--chart-series-4)',
  'var(--chart-series-5)',
];

const TOOLTIP_CONTENT_STYLE = {
  background: 'var(--chart-tooltip-bg)',
  border: '1px solid var(--chart-tooltip-border)',
  borderRadius: 'var(--radius-md)',
  padding: '10px 14px',
  color: 'var(--chart-tooltip-text)',
  fontSize: '0.82rem',
  lineHeight: 1.4,
};

const TOOLTIP_ITEM_STYLE = {
  color: 'var(--chart-text)',
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
            stroke="var(--chart-grid)"
          />

          <XAxis
            dataKey="label"
            stroke="var(--chart-axis)"
            tick={{ fontSize: 11, fill: 'var(--chart-text)' }}
          />

          <YAxis
            stroke="var(--chart-axis)"
            tick={{ fontSize: 11, fill: 'var(--chart-text)' }}
          />

          <Tooltip
            cursor={{ fill: 'var(--chart-cursor-fill)' }}
            contentStyle={TOOLTIP_CONTENT_STYLE}
            itemStyle={TOOLTIP_ITEM_STYLE}
          />

          <Bar
            dataKey="value"
            radius={[8, 8, 0, 0]}
            fill="var(--chart-series-4)"
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
            stroke="var(--chart-grid)"
          />

          <XAxis
            dataKey="label"
            stroke="var(--chart-axis)"
            tick={{ fontSize: 11, fill: 'var(--chart-text)' }}
          />

          <YAxis
            stroke="var(--chart-axis)"
            tick={{ fontSize: 11, fill: 'var(--chart-text)' }}
          />

          <Tooltip
            contentStyle={TOOLTIP_CONTENT_STYLE}
            itemStyle={TOOLTIP_ITEM_STYLE}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--chart-line-stroke)"
            strokeWidth={3}
            dot={{ r: 4, fill: 'var(--chart-line-stroke)' }}
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

