import prisma from "../../../config/prisma.js";

export type ProductionDetailPublic = {
  id_production_detail: number;
  quantity_delivered?: number | null;
  amount_received?: number | null;
  date_received?: Date | null;
  delivery_date?: Date | null;
  status?: boolean | null;
  id_production?: number | null;
};

export async function getAllProductionDetails(): Promise<ProductionDetailPublic[]> {
  return prisma.production_details.findMany();
}

export async function createProductionDetail(data: { quantity_delivered?: number; amount_received?: number; date_received?: Date | string; delivery_date?: Date | string; id_production?: number }): Promise<ProductionDetailPublic | null> {
  try {
    const prodData: any = { ...data };
    if (data.date_received && typeof data.date_received === 'string') {
      prodData.date_received = new Date(data.date_received);
    }
    if (data.delivery_date && typeof data.delivery_date === 'string') {
      prodData.delivery_date = new Date(data.delivery_date);
    }
    return await prisma.production_details.create({ data: prodData });
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function deleteProductionDetail(id_production_detail: number): Promise<boolean> {
  try {
    await prisma.production_details.delete({ where: { id_production_detail } });
    return true;
  } catch (error) {
    return false;
  }
}

