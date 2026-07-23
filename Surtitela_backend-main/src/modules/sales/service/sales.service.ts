import prisma from "../../../config/prisma.js";
import { normalizarPrismaEntidad } from "../../../shared/prisma-utils.js";

export type SalePublic = {
  id_sale: number;
  sale_date?: Date | null;
  quantity?: number | null;
  unit_value?: number | null;
  vat_value?: number | null;
  discount_value?: number | null;
  total_value?: number | null;
  status?: boolean | null;
  id_customer?: number | null;
  id_order?: number | null;
};

export async function getAllSales(): Promise<SalePublic[]> {
  const sales = await prisma.sales.findMany();
  return sales.map((sale) => normalizarPrismaEntidad(sale) as SalePublic);
}

export async function createSale(data: { sale_date?: Date | string; quantity?: number; unit_value?: number; vat_value?: number; discount_value?: number; total_value?: number; id_customer?: number; id_order?: number }): Promise<SalePublic | null> {
  try {
    const saleData: any = { ...data };
    if (data.sale_date && typeof data.sale_date === 'string') {
      saleData.sale_date = new Date(data.sale_date);
    }
    const sale = await prisma.sales.create({ data: saleData });
    return normalizarPrismaEntidad(sale) as SalePublic;
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function deleteSale(id_sale: number): Promise<boolean> {
  try {
    await prisma.sales.delete({ where: { id_sale } });
    return true;
  } catch (error) {
    return false;
  }
}

