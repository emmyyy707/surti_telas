export enum NotificationType {
  ORDER_STATUS_CHANGE = 'ORDER_STATUS_CHANGE',
  ORDER_DELIVERED = 'ORDER_DELIVERED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  STOCK_ALERT = 'STOCK_ALERT',
  COMMISSION_READY = 'COMMISSION_READY',
  NEW_ORDER_ASSIGNED = 'NEW_ORDER_ASSIGNED',
}

export interface CrossPanelNotification {
  id: string;
  type: NotificationType;
  recipientRole: string;
  recipientId: string;
  message: string;
  orderId: string | null;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}
