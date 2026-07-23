import type { Order } from '../../domain/entities/Order';
import type { AuthUser } from '../../../auth/domain/entities/User';

export function canView(order: Order, user: AuthUser): boolean {
  if (user.role === 'ADMIN') return true;
  return order.asesor === user.id;
}

export function canUpdateStatus(order: Order, user: AuthUser): boolean {
  if (user.role === 'ADMIN') return true;
  return order.asesor === user.id;
}
