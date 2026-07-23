import prisma from "../../../config/prisma.js";
import { normalizarPrismaEntidad } from "../../../shared/prisma-utils.js";

export async function createCheckout(data: {
  clienteId?: number;
  carrito?: Array<{ id_product: number; quantity: number; unit_value: number }>;
  banco?: string;
  tipoPago?: string;
  cuotas?: number;
  total?: number;
  comprobante?: string;
}) {
  try {
    const order = await prisma.orders.create({
      data: {
        id_customer: data.clienteId,
        total: data.total ?? 0,
        subtotal: data.total ?? 0,
        order_date: new Date(),
        status: true,
        orders_details: data.carrito
          ? {
              create: data.carrito.map((item) => ({
                id_product: item.id_product,
                quantity: item.quantity,
                unit_value: item.unit_value,
                subtotal: item.quantity * item.unit_value,
              })),
            }
          : undefined,
      },
      include: { orders_details: true },
    });
    return normalizarPrismaEntidad(order);
  } catch (error) {
    console.error("Error en checkout:", error);
    return null;
  }
}
