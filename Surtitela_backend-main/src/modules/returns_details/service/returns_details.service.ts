import prisma from "../../../config/prisma.js";
import { normalizarPrismaEntidad } from "../../../shared/prisma-utils.js";

export type ReturnDetailPublic = {
  id_return_detail: number;
  quantity: number;
  subtotal?: number | null;
  id_return?: number | null;
  id_product?: number | null;
};

export async function getAllReturnDetails(): Promise<ReturnDetailPublic[]> {
  const returnDetails = await prisma.returns_details.findMany();
  return returnDetails.map((detail) => normalizarPrismaEntidad(detail) as ReturnDetailPublic);
}

export async function createReturnDetail(data: { quantity: number; subtotal?: number; id_return?: number; id_product?: number }): Promise<ReturnDetailPublic | null> {
  try {
    const returnDetail = await prisma.returns_details.create({ data });
    return normalizarPrismaEntidad(returnDetail) as ReturnDetailPublic;
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function deleteReturnDetail(id_return_detail: number): Promise<boolean> {
  try {
    await prisma.returns_details.delete({ where: { id_return_detail } });
    return true;
  } catch (error) {
    return false;
  }
}

