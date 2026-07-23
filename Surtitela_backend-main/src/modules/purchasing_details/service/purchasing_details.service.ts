import prisma from "../../../config/prisma.js";
import { normalizarPrismaEntidad } from "../../../shared/prisma-utils.js";

export type PurchasingDetailPublic = {
  id_purchase_detail: number;
  quantity: number;
  unit_value: number;
  subtotal?: number | null;
  id_purchase?: number | null;
  id_product?: number | null;
};

export async function getAllPurchasingDetails(): Promise<PurchasingDetailPublic[]> {
  const purchaseDetails = await prisma.purchasing_details.findMany();
  return purchaseDetails.map((detail) => normalizarPrismaEntidad(detail) as PurchasingDetailPublic);
}

export async function createPurchasingDetail(data: { quantity: number; unit_value: number; subtotal?: number; id_purchase?: number; id_product?: number }): Promise<PurchasingDetailPublic | null> {
  try {
    const purchasingDetail = await prisma.purchasing_details.create({ data });
    return normalizarPrismaEntidad(purchasingDetail) as PurchasingDetailPublic;
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function deletePurchasingDetail(id_purchase_detail: number): Promise<boolean> {
  try {
    await prisma.purchasing_details.delete({ where: { id_purchase_detail } });
    return true;
  } catch (error) {
    return false;
  }
}

