import prisma from "../../../config/prisma.js";
import { normalizarPrismaEntidad } from "../../../shared/prisma-utils.js";

export type DeliveryPublic = {
  id_delivery: number;
  total?: number | null;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  id_customer?: number | null;
  id_employee?: number | null;
  id_order?: number | null;
};

export async function getAllDeliveries(): Promise<DeliveryPublic[]> {
  const deliveries = await prisma.deliveries.findMany();
  return deliveries.map((delivery) => normalizarPrismaEntidad(delivery) as DeliveryPublic);
}

export async function createDelivery(data: { total?: number; address?: string; city?: string; phone?: string; id_customer?: number; id_employee?: number; id_order?: number }): Promise<DeliveryPublic | null> {
  try {
    const delivery = await prisma.deliveries.create({ data });
    return normalizarPrismaEntidad(delivery) as DeliveryPublic;
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function deleteDelivery(id_delivery: number): Promise<boolean> {
  try {
    await prisma.deliveries.delete({ where: { id_delivery } });
    return true;
  } catch (error) {
    return false;
  }
}

