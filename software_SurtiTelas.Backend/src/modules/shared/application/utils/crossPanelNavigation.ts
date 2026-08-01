export interface CrossPanelLink {
  label: string;
  path: string;
  roles: string[];
  description: string;
}

export const CROSS_PANEL_LINKS: CrossPanelLink[] = [
  {
    label: 'Ver Asesor',
    path: '/admin/asesores',
    roles: ['admin'],
    description: 'Desde un pedido, ver el asesor asignado',
  },
  {
    label: 'Ver Reporte Financiero',
    path: '/admin/financial/report',
    roles: ['admin'],
    description: 'Desde el panel del Asesor, ver el reporte financiero del cliente',
  },
  {
    label: 'Ficha Completa del Pedido',
    path: '/admin/pedidos',
    roles: ['domiciliario', 'admin'],
    description: 'Desde el tracking de entrega, ver la ficha completa del pedido',
  },
  {
    label: 'Contactar Asesor',
    path: '/cliente/comunicacion',
    roles: ['cliente'],
    description: 'Desde los pedidos del cliente, contactar al asesor asignado',
  },
  {
    label: 'Ver Pedidos del Cliente',
    path: '/admin/clientes',
    roles: ['asesor', 'admin'],
    description: 'Desde un pedido, ver todos los pedidos del cliente',
  },
  {
    label: 'Ver Produccion',
    path: '/admin/produccion',
    roles: ['admin', 'asesor'],
    description: 'Desde el estado del pedido, ver el detalle de produccion',
  },
];

export function getCrossPanelLinks(userRole: string): CrossPanelLink[] {
  return CROSS_PANEL_LINKS.filter((link) => link.roles.includes(userRole));
}
