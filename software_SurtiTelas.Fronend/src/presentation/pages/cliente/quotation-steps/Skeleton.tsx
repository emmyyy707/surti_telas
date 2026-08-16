import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string;
  style?: React.CSSProperties;
}

export const Skeleton = ({ width = '100%', height = 16, radius = 'var(--radius-sm)', style }: SkeletonProps) => {
  const pxWidth = typeof width === 'number' ? `${width}px` : width;
  const pxHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      style={{
        width: pxWidth,
        height: pxHeight,
        borderRadius: radius,
        background: 'linear-gradient(90deg, var(--color-bg-elevated) 25%, var(--color-bg-surface) 50%, var(--color-bg-elevated) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonPulse 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  );
};
