export const CustomOrderStatusTransitions: Record<string, string[]> = {
  PENDIENTE: ['ACEPTADO', 'CANCELADO'],
  ACEPTADO: ['CANCELADO'],
  CANCELADO: [],
  SOLICITUD_RECIBIDA: ['ACEPTADO', 'CANCELADO'],
  EN_REVISION: ['CANCELADO'],
  COTIZADO: ['COTIZACION_ACEPTADA', 'COTIZACION_RECHAZADA', 'CANCELADO'],
  COTIZACION_ACEPTADA: ['PAGO_PENDIENTE', 'CANCELADO'],
  COTIZACION_RECHAZADA: ['SOLICITUD_RECIBIDA', 'CANCELADO'],
  PAGO_PENDIENTE: ['PAGO_EN_VERIFICACION', 'CANCELADO'],
  PAGO_EN_VERIFICACION: ['PAGO_APROBADO', 'CANCELADO'],
  PAGO_APROBADO: ['CONVERTIDO_A_PEDIDO', 'EN_PRODUCCION', 'CANCELADO'],
  EN_PRODUCCION: ['COMPLETADO', 'CANCELADO'],
  COMPLETADO: [],
  CONVERTIDO_A_PEDIDO: [],
  VENCIDO: [],
};

export const isAllowedStatusTransition = (current: string, next: string): boolean => {
  const allowed = CustomOrderStatusTransitions[current] || [];
  return allowed.includes(next);
};
