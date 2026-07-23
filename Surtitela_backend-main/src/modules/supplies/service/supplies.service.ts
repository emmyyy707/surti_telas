import prisma from "../../../config/prisma.js";

export type SupplyPublic = {
  id_supply: number;
  name: string;
  stock?: number | null;
  status?: boolean | null;
  id_product_category?: number | null;
};

export async function getAllSupplies(): Promise<SupplyPublic[]> {
  return prisma.supplies.findMany();
}

export async function createSupply(data: { name: string; stock?: number; id_product_category?: number }): Promise<SupplyPublic | null> {
  try {
    return await prisma.supplies.create({ data });
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function deleteSupply(id_supply: number): Promise<boolean> {
  try {
    await prisma.supplies.delete({ where: { id_supply } });
    return true;
  } catch (error) {
    return false;
  }
}

