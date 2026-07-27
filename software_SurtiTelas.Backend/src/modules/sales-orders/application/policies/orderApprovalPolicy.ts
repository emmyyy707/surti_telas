import type { Order } from '../../../orders/domain/entities/Order';
import type { AuthUser } from '../../../auth/domain/entities/User';

export function canViewOrder(order: Order, user: AuthUser): boolean {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'ASESOR') return order.asesorId === user.id;
  if (user.role === 'CLIENTE') return order.clienteId === user.id;
  return false;
}

export function canUploadPaymentProof(order: Order, user: AuthUser): boolean {
  if (user.role === 'CLIENTE') return order.clienteId === user.id && order.canAcceptPaymentProof();
  return false;
}

export function canStartValidation(order: Order, user: AuthUser): boolean {
  if (user.role === 'ADMIN') return order.canBeValidated();
  if (user.role === 'ASESOR') return order.asesorId === user.id && order.canBeValidated();
  return false;
}

export function canAcceptOrder(order: Order, user: AuthUser): boolean {
  if (user.role === 'ADMIN') return order.canBeAccepted();
  if (user.role === 'ASESOR') return order.asesorId === user.id && order.canBeAccepted();
  return false;
}

export function canRejectOrder(order: Order, user: AuthUser): boolean {
  if (user.role === 'ADMIN') return order.canBeRejected();
  if (user.role === 'ASESOR') return order.asesorId === user.id && order.canBeRejected();
  return false;
}

export function canRetryReceipt(order: Order, user: AuthUser): boolean {
  if (user.role === 'ADMIN') return order.estado === 'Recibo generado';
  if (user.role === 'ASESOR') return order.asesorId === user.id && order.estado === 'Recibo generado';
  return false;
}

export function canViewSalesReport(user: AuthUser): boolean {
  return user.role === 'ADMIN' || user.role === 'ASESOR' || user.role === 'REPORTES';
}
