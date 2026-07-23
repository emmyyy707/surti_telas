import prisma from "../../../config/prisma.js";
import { normalizarPrismaEntidad } from "../../../shared/prisma-utils.js";

export type OrderDetailPublic = {
  id_order_detail: number;
  id_order?: number | null;
  id_product?: number | null;
  quantity?: number | null;
  unit_value?: number | null;
  subtotal?: number | null;
};

export async function getAllOrderDetails(): Promise<OrderDetailPublic[]> {
  const orderDetails = await prisma.orders_details.findMany();
  return orderDetails.map((detail) => normalizarPrismaEntidad(detail) as OrderDetailPublic);
}

export async function createOrderDetail(data: { id_order?: number; id_product?: number; quantity?: number; unit_value?: number; subtotal?: number }): Promise<OrderDetailPublic | null> {
  try {
    const orderDetail = await prisma.orders_details.create({ data });
    return normalizarPrismaEntidad(orderDetail) as OrderDetailPublic;
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function deleteOrderDetail(id_order_detail: number): Promise<boolean> {
  try {
    await prisma.orders_details.delete({ where: { id_order_detail } });
    return true;
  } catch (error) {
    return false;
  }
}

