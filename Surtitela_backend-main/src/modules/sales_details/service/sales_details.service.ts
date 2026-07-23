import prisma from "../../../config/prisma.js";
import { normalizarPrismaEntidad } from "../../../shared/prisma-utils.js";

export type SaleDetailPublic = {
  id_sale_detail: number;
  id_sale?: number | null;
  id_product?: number | null;
  quantity?: number | null;
  unit_value?: number | null;
  subtotal?: number | null;
};

export async function getAllSaleDetails(): Promise<SaleDetailPublic[]> {
  const saleDetails = await prisma.sales_details.findMany();
  return saleDetails.map((detail) => normalizarPrismaEntidad(detail) as SaleDetailPublic);
}

export async function createSaleDetail(data: { id_sale?: number; id_product?: number; quantity?: number; unit_value?: number; subtotal?: number }): Promise<SaleDetailPublic | null> {
  try {
    const saleDetail = await prisma.sales_details.create({ data });
    return normalizarPrismaEntidad(saleDetail) as SaleDetailPublic;
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function deleteSaleDetail(id_sale_detail: number): Promise<boolean> {
  try {
    await prisma.sales_details.delete({ where: { id_sale_detail } });
    return true;
  } catch (error) {
    return false;
  }
}

