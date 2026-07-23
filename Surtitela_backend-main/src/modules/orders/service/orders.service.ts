import prisma from "../../../config/prisma.js";
import { normalizarPrismaEntidad } from "../../../shared/prisma-utils.js";

export type OrderPublic = {
  id: number;
  clienteId?: number | null;
  clienteNombre?: string | null;
  asesorId?: number | null;
  asesorNombre?: string | null;
  fecha?: string | null;
  items?: unknown[];
  total?: number | null;
  estado?: string;
  direccionEntrega?: string | null;
  metodoPago?: string | null;
  paymentStatus?: string | null;
  comprobantePagoUrl?: string | null;
  observaciones?: string | null;
};

function normalizeOrder(order: any): OrderPublic {
  const normalized = normalizarPrismaEntidad(order);
  const customer = normalized.customers ?? {};
  return {
    id: normalized.id_order,
    clienteId: normalized.id_customer,
    clienteNombre: customer.users ? `${customer.users.name} ${customer.users.last_name}`.trim() : null,
    asesorId: null,
    asesorNombre: null,
    fecha: normalized.order_date ? new Date(normalized.order_date).toISOString() : null,
    items: normalized.orders_details?.map((item: any) => ({
      productId: item.id_product,
      quantity: item.quantity,
      unit_value: item.unit_value,
      subtotal: item.subtotal,
    })) ?? [],
    total: normalized.total,
    estado: normalized.status ? "Nuevo" : "Cancelado",
    direccionEntrega: normalized.deliveries?.[0]?.address ?? null,
    metodoPago: null,
    paymentStatus: normalized.payments?.[0]?.status ? "Pagado" : "Pendiente",
    comprobantePagoUrl: null,
    observaciones: null,
  };
}

export async function getAllOrders(filters?: { status?: string; id_customer?: number; role?: string; userId?: number }): Promise<OrderPublic[]> {
  const where: any = {};

  if (filters?.status) {
    if (filters.status === "Cancelado") {
      where.status = false;
    } else {
      where.status = true;
    }
  }

  if (filters?.id_customer) {
    where.id_customer = filters.id_customer;
  }

  if (filters?.role === "cliente" && filters.userId) {
    const customer = await prisma.customers.findUnique({ where: { id_user: filters.userId } });
    if (customer) {
      where.id_customer = customer.id_customer;
    } else {
      return [];
    }
  }

  const orders = await prisma.orders.findMany({
    where,
    include: { customers: { include: { users: true } }, orders_details: true, deliveries: true, payments: true },
  });
  return orders.map(normalizeOrder);
}

export async function getOrderById(id_order: number): Promise<OrderPublic | null> {
  const order = await prisma.orders.findUnique({
    where: { id_order },
    include: { customers: { include: { users: true } }, orders_details: true, deliveries: true, payments: true },
  });
  return order ? normalizeOrder(order) : null;
}

export async function createOrder(data: { order_date?: Date | string; quantity?: number; subtotal?: number; total?: number; id_customer?: number; items?: Array<{ id_product: number; quantity: number; unit_value: number }> }): Promise<OrderPublic | null> {
  try {
    const orderData: any = { ...data };
    if (data.order_date && typeof data.order_date === "string") {
      orderData.order_date = new Date(data.order_date);
    }
    const { items, ...raw } = orderData;
    const order = await prisma.orders.create({
      data: {
        ...raw,
        orders_details: items
          ? {
              create: items.map((item: { id_product: number; quantity: number; unit_value: number }) => ({
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
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function updateOrder(id_order: number, data: { order_date?: Date | string; quantity?: number; subtotal?: number; total?: number; id_customer?: number; status?: boolean }): Promise<OrderPublic | null> {
  try {
    const orderData: any = { ...data };
    if (data.order_date && typeof data.order_date === "string") {
      orderData.order_date = new Date(data.order_date);
    }
    const order = await prisma.orders.update({
      where: { id_order },
      data: orderData,
      include: { customers: { include: { users: true } }, orders_details: true, deliveries: true, payments: true },
    });
    return normalizeOrder(order);
  } catch (error) {
    console.error("Error actualizando orden:", error);
    return null;
  }
}

export async function updateOrderStatus(id_order: number, status: string): Promise<OrderPublic | null> {
  try {
    const active = status !== "Cancelado";
    const order = await prisma.orders.update({
      where: { id_order },
      data: { status: active },
      include: { customers: { include: { users: true } }, orders_details: true, deliveries: true, payments: true },
    });
    return normalizeOrder(order);
  } catch (error) {
    console.error("Error actualizando estado de orden:", error);
    return null;
  }
}

export async function deleteOrder(id_order: number): Promise<boolean> {
  try {
    await prisma.orders.delete({ where: { id_order } });
    return true;
  } catch (error) {
    return false;
  }
}

export async function payOrder(id_order: number, data: { payment_date: Date | string; amount: number; status?: boolean }) {
  try {
    const paymentData: any = { ...data };
    if (typeof paymentData.payment_date === "string") {
      paymentData.payment_date = new Date(paymentData.payment_date);
    }
    const payment = await prisma.payments.create({
      data: { ...paymentData, id_order },
    });
    return normalizarPrismaEntidad(payment);
  } catch (error) {
    console.error("Error creando pago:", error);
    return null;
  }
}

