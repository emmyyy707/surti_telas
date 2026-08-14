import type { PedidoPersonalizado } from '../../domain/entities/PedidoPersonalizado';
import type { AuthUser } from '../../../auth/domain/entities/User';

export function canView(pedido: PedidoPersonalizado, user: AuthUser): boolean {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'CLIENTE') return pedido.clienteId === user.id;
  return pedido.asesorId === user.id;
}

export function canUpdateStatus(pedido: PedidoPersonalizado, user: AuthUser): boolean {
  if (user.role === 'ADMIN') return true;
  return pedido.asesorId === user.id;
}
