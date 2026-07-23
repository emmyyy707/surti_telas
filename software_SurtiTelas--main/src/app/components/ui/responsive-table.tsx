/**
 * ResponsiveTable - Wrapper para hacer tablas completamente responsivas
 * 
 * Envuelve cualquier tabla para que tenga scroll horizontal en móvil
 * y se vea perfectamente en todos los tamaños de pantalla.
 */

import { ReactNode } from 'react';

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className = '' }: ResponsiveTableProps) {
  return (
    <div className={`w-full overflow-x-auto rounded-lg border border-gray-200 bg-white ${className}`}>
      <div className="min-w-full inline-block align-middle">
        {children}
      </div>
    </div>
  );
}

/**
 * Uso:
 * 
 * <ResponsiveTable>
 *   <Table>
 *     <TableHeader>...</TableHeader>
 *     <TableBody>...</TableBody>
 *   </Table>
 * </ResponsiveTable>
 */



