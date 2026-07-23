export type OrderItem = {
  id_product: number;
  quantity: number;
  unit_value: number;
  subtotal?: number;
};

export type OrderEntity = {
  id_order: number;
  order_date?: Date;
  quantity?: number;
  subtotal?: number;
  total?: number;
  status?: boolean | null;
  id_customer?: number | null;
};

export type PublicOrder = {
  id: number;
  clienteId?: number | null;
  clienteNombre?: string | null;
  asesorId?: number | null;
  asesorNombre?: string | null;
  fecha?: string | null;
  items?: OrderItem[];
  total?: number | null;
  estado?: string;
  direccionEntrega?: string | null;
  metodoPago?: string | null;
  paymentStatus?: string | null;
  comprobantePagoUrl?: string | null;
  observaciones?: string | null;
};
