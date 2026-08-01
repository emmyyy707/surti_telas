import { api } from './httpClient';

export interface DeliveryTracking {
  id: string;
  estado: string;
  ubicacion: { lat: number; lng: number } | null;
  observaciones: string | null;
  createdAt: string;
  updatedBy: string | null;
}

export interface DeliveryStatus {
  orderId: string;
  orderNumero: string;
  estado: string;
  cliente: unknown;
  tracking: DeliveryTracking[];
  estimatedDelivery: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export const deliveryApi = {
  getTracking: (orderId: string) =>
    api.get<DeliveryStatus>(`/admin/delivery/${orderId}/tracking`),

  getHistory: (orderId: string) =>
    api.get<DeliveryTracking[]>(`/admin/delivery/${orderId}/history`),

  updateStatus: (orderId: string, data: { estado: string; ubicacion?: { lat: number; lng: number }; observaciones?: string }) =>
    api.patch<DeliveryStatus>(`/admin/delivery/${orderId}/tracking`, data),
};
