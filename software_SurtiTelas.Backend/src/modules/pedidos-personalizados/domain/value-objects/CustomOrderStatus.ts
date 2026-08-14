export const CustomOrderStatus = {
  SOLICITUD_RECIBIDA: 'SOLICITUD_RECIBIDA',
  EN_REVISION: 'EN_REVISION',
  COTIZADO: 'COTIZADO',
  COTIZACION_ACEPTADA: 'COTIZACION_ACEPTADA',
  COTIZACION_RECHAZADA: 'COTIZACION_RECHAZADA',
  PAGO_PENDIENTE: 'PAGO_PENDIENTE',
  PAGO_EN_VERIFICACION: 'PAGO_EN_VERIFICACION',
  PAGO_APROBADO: 'PAGO_APROBADO',
  CONVERTIDO_A_PEDIDO: 'CONVERTIDO_A_PEDIDO',
  EN_PRODUCCION: 'EN_PRODUCCION',
  COMPLETADO: 'COMPLETADO',
  CANCELADO: 'CANCELADO',
  VENCIDO: 'VENCIDO',
} as const;

export type CustomOrderStatusType = typeof CustomOrderStatus[keyof typeof CustomOrderStatus];

export const QuotationStatus = {
  BORRADOR: 'BORRADOR',
  ENVIADA: 'ENVIADA',
  ACEPTADA: 'ACEPTADA',
  RECHAZADA: 'RECHAZADA',
  VENCIDA: 'VENCIDA',
} as const;

export type QuotationStatusType = typeof QuotationStatus[keyof typeof QuotationStatus];

export const PersonalizationType = {
  DISENO_ESPECIAL: 'DISENO_ESPECIAL',
  MEDIDA_ESPECIFICA: 'MEDIDA_ESPECIFICA',
  MATERIAL_PERSONALIZADO: 'MATERIAL_PERSONALIZADO',
  BORDADO_ESTAMPADO: 'BORDADO_ESTAMPADO',
  COLOR_PERSONALIZADO: 'COLOR_PERSONALIZADO',
  LOGOTIPO: 'LOGOTIPO',
  COMBINACION_MULTIPLE: 'COMBINACION_MULTIPLE',
} as const;

export type PersonalizationTypeType = typeof PersonalizationType[keyof typeof PersonalizationType];

export const QuotationItemType = {
  PRODUCTO_BASE: 'PRODUCTO_BASE',
  MATERIA_PRIMA: 'MATERIA_PRIMA',
  MANO_OBRA: 'MANO_OBRA',
  DISENO: 'DISENO',
  LOGISTICA: 'LOGISTICA',
  OTRO: 'OTRO',
} as const;

export type QuotationItemTypeType = typeof QuotationItemType[keyof typeof QuotationItemType];
