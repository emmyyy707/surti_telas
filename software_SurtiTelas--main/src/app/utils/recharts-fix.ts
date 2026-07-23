import { ComponentType, SVGProps } from 'react';
import * as Recharts from 'recharts';

// Fix for Recharts 3.x with React 18 - SVG element warnings
// This ensures all SVG components are properly registered
const createSvgComponent = (tag: string): ComponentType<SVGProps<SVGElement>> => {
  const component = (props: SVGProps<SVGElement>) => {
    return React.createElement(tag, props);
  };
  component.displayName = tag;
  return component;
};

// Re-export all Recharts components with proper typing
export * from 'recharts';

