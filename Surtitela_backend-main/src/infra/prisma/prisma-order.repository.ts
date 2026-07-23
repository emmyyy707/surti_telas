import prisma from "../../config/prisma.js";
import { OrderRepository } from "../../core/interfaces/order.repository.js";
import { OrderItem, PublicOrder } from "../../core/domain/order.js";

function normalizeOrder(order: any): PublicOrder {
  const customer = order.customers ?? {};
  return {
    id: order.id_order,
    clienteId: order.id_customer,
    clienteNombre: customer.users ? `${customer.users.name} ${customer.users.last_name}`.trim() : null,
    asesorId: null,
    asesorNombre: null,
    fecha: order.order_date ? new Date(order.order_date).toISOString() : null,
    items: order.orders_details?.map((item: any) => ({
      id_product: item.id_product,
      quantity: item.quantity,
      unit_value: Number(item.unit_value),
      subtotal: Number(item.subtotal),
    })) ?? [],
    total: Number(order.total),
    estado: order.status ? "Nuevo" : "Cancelado",
    direccionEntrega: order.deliveries?.[0]?.address ?? null,
    metodoPago: null,
    paymentStatus: order.payments?.[0]?.status ? "Pagado" : "Pendiente",
    comprobantePagoUrl: null,
    observaciones: null,
  };
}

export class PrismaOrderRepository implements OrderRepository {
  async findAll(filters?: { status?: string; id_customer?: number; role?: string; userId?: number }) {
    const where: any = {};
    if (filters?.status) {
      where.status = filters.status === "Cancelado" ? false : true;
    }
    if (filters?.id_customer) {
      where.id_customer = filters.id_customer;
    }
    if (filters?.role === "cliente" && filters.userId) {
      const customer = await prisma.customers.findUnique({ where: { id_user: filters.userId } });
      if (!customer) return [];
      where.id_customer = customer.id_customer;
    }
    const orders = await prisma.orders.findMany({
      where,
      include: { customers: { include: { users: true } }, orders_details: true, deliveries: true, payments: true },
    });
    return orders.map(normalizeOrder);
  }

  async findById(id_order: number) {
    const order = await prisma.orders.findUnique({ where: { id_order }, include: { customers: { include: { users: true } }, orders_details: true, deliveries: true, payments: true } });
    return order ? normalizeOrder(order) : null;
  }

  async create(data: { order_date?: Date | string; quantity?: number; subtotal?: number; total?: number; id_customer?: number; items?: OrderItem[] }) {
    const orderData: any = { ...data };
    if (typeof orderData.order_date === "string") orderData.order_date = new Date(orderData.order_date);
    const order = await prisma.orders.create({
      data: {
        ...orderData,
        orders_details: data.items
          ? {
              create: data.items.map((item) => ({
                id_product: item.id_product,
                quantity: item.quantity,
                unit_value: item.unit_value,
                subtotal: item.quantity * item.unit_value,
              })),
            }
          : undefined,
      },
      include: { customers: { include: { users: true } }, orders_details: true, deliveries: true, payments: true },
    });
    return normalizeOrder(order);
  }

  async update(id_order: number, data: { order_date?: Date | string; quantity?: number; subtotal?: number; total?: number; id_customer?: number; status?: boolean }) {
    const orderData: any = { ...data };
    if (typeof orderData.order_date === "string") orderData.order_date = new Date(orderData.order_date);
    const order = await prisma.orders.update({ where: { id_order }, data: orderData, include: { customers: { include: { users: true } }, orders_details: true, deliveries: true, payments: true } });
    return normalizeOrder(order);
  }

  async updateStatus(id_order: number, status: string) {
    const order = await prisma.orders.update({ where: { id_order }, data: { status: status !== "Cancelado" }, include: { customers: { include: { users: true } }, orders_details: true, deliveries: true, payments: true } });
    return normalizeOrder(order);
  }

  async delete(id_order: number) {
    try {
      await prisma.orders.delete({ where: { id_order } });
      return true;
    } catch {
      return false;
    }
  }

  async pay(id_order: number, data: { payment_date: Date | string; amount: number; status?: boolean }) {
    const paymentData: any = { ...data };
    if (typeof paymentData.payment_date === "string") paymentData.payment_date = new Date(paymentData.payment_date);
    const payment = await prisma.payments.create({ data: { ...paymentData, id_order } });
    return payment;
  }
}
