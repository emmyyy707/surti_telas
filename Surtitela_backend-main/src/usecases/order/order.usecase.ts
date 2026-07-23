import { OrderRepository } from "../../core/interfaces/order.repository.js";
import { OrderItem, PublicOrder } from "../../core/domain/order.js";

export class OrderUseCase {
  constructor(private orderRepository: OrderRepository) {}

  async list(filters?: { status?: string; id_customer?: number; role?: string; userId?: number }): Promise<PublicOrder[]> {
    return this.orderRepository.findAll(filters);
  }

  async getById(id_order: number): Promise<PublicOrder | null> {
    return this.orderRepository.findById(id_order);
  }

  async create(data: { order_date?: Date | string; quantity?: number; subtotal?: number; total?: number; id_customer?: number; items?: OrderItem[] }): Promise<PublicOrder | null> {
    return this.orderRepository.create(data);
  }

  async update(id_order: number, data: { order_date?: Date | string; quantity?: number; subtotal?: number; total?: number; id_customer?: number; status?: boolean }): Promise<PublicOrder | null> {
    return this.orderRepository.update(id_order, data);
  }

  async updateStatus(id_order: number, status: string): Promise<PublicOrder | null> {
    return this.orderRepository.updateStatus(id_order, status);
  }

  async delete(id_order: number): Promise<boolean> {
    return this.orderRepository.delete(id_order);
  }

  async pay(id_order: number, data: { payment_date: Date | string; amount: number; status?: boolean }): Promise<any | null> {
    return this.orderRepository.pay(id_order, data);
  }
}
