import type { Order } from '../../domain/entities/Order';
import type { AuthUser } from '../../../auth/domain/entities/User';

export function canView(order: Order, user: AuthUser): boolean {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'CLIENTE') return order.clienteId === user.id;
  return order.asesorId === user.id;
}

export function canUpdateStatus(order: Order, user: AuthUser): boolean {
  if (user.role === 'ADMIN') return true;
  return order.asesorId === user.id;
}
