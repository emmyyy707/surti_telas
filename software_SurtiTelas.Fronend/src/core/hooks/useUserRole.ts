import { useEffect } from 'react';

const _ROLES = ['admin', 'asesor', 'domiciliario', 'cliente'] as const;
type Role = (typeof _ROLES)[number];

export const useUserRole = (role: Role): void => {
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

