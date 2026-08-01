export const PERMISSIONS = {
  orders: ['orders:read', 'orders:create', 'orders:update', 'orders:delete', 'orders:approve'],
  reports: ['reports:read', 'reports:export', 'reports:generate'],
  stock: ['stock:read', 'stock:manage', 'stock:alert'],
  commissions: ['commissions:read', 'commissions:manage'],
  delivery: ['delivery:read', 'delivery:update', 'delivery:track'],
  customers: ['customers:read', 'customers:create', 'customers:update', 'customers:delete'],
  users: ['users:read', 'users:create', 'users:update', 'users:delete'],
  audit: ['audit:read'],
  financial: ['financial:read', 'financial:export'],
  config: ['config:read', 'config:update'],
  alerts: ['alerts:read', 'alerts:manage'],
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS][number];
