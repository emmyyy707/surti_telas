import { useEffect } from 'react';

export const useUserRole = (role: string): void => {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-role', role);

    return () => {
      root.removeAttribute('data-role');
    };
  }, [role]);
};

export const clearUserRole = (): void => {
  if (typeof document === 'undefined') return;
  document.documentElement.removeAttribute('data-role');
};
