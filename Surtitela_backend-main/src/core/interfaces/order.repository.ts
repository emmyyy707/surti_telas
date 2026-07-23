import { OrderItem, PublicOrder } from "../domain/order.js";

export interface OrderRepository {
  findAll(filters?: { status?: string; id_customer?: number; role?: string; userId?: number }): Promise<PublicOrder[]>;
  findById(id_order: number): Promise<PublicOrder | null>;
  create(data: { order_date?: Date | string; quantity?: number; subtotal?: number; total?: number; id_customer?: number; items?: OrderItem[] }): Promise<PublicOrder | null>;
  update(id_order: number, data: { order_date?: Date | string; quantity?: number; subtotal?: number; total?: number; id_customer?: number; status?: boolean }): Promise<PublicOrder | null>;
  updateStatus(id_order: number, status: string): Promise<PublicOrder | null>;
  delete(id_order: number): Promise<boolean>;
  pay(id_order: number, data: { payment_date: Date | string; amount: number; status?: boolean }): Promise<any | null>;
}
