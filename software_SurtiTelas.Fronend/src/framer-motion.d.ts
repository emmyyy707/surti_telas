declare module 'framer-motion' {
  import { type ReactNode } from 'react';
  export function motion(props: { children?: ReactNode; [key: string]: unknown }): JSX.Element;
  export const AnimatePresence: React.FC<{ children?: ReactNode }>;
}