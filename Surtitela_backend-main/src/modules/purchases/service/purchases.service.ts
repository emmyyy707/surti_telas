import prisma from "../../../config/prisma.js";
import { normalizarPrismaEntidad } from "../../../shared/prisma-utils.js";

export type PurchasePublic = {
  id_purchase: number;
  purchase_date: Date;
  total?: number | null;
  status?: boolean | null;
  id_supplier?: number | null;
};

export async function getAllPurchases(): Promise<PurchasePublic[]> {
  const purchases = await prisma.purchases.findMany();
  return purchases.map((purchase) => normalizarPrismaEntidad(purchase) as PurchasePublic);
}

export async function createPurchase(data: { purchase_date: Date | string; total?: number; id_supplier?: number }): Promise<PurchasePublic | null> {
  try {
    const purData: any = { ...data };
    if (typeof data.purchase_date === 'string') {
      purData.purchase_date = new Date(data.purchase_date);
    }
    const purchase = await prisma.purchases.create({ data: purData });
    return normalizarPrismaEntidad(purchase) as PurchasePublic;
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function deletePurchase(id_purchase: number): Promise<boolean> {
  try {
    await prisma.purchases.delete({ where: { id_purchase } });
    return true;
  } catch (error) {
    return false;
  }
}

