import prisma from "../../../config/prisma.js";

export type ProductionPublic = {
  id_production: number;
  status?: boolean | null;
  id_workshop?: number | null;
  id_product?: number | null;
};

export async function getAllProductions(): Promise<ProductionPublic[]> {
  return prisma.productions.findMany();
}

export async function createProduction(data: { id_workshop?: number; id_product?: number }): Promise<ProductionPublic | null> {
  try {
    return await prisma.productions.create({ data });
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function deleteProduction(id_production: number): Promise<boolean> {
  try {
    await prisma.productions.delete({ where: { id_production } });
    return true;
  } catch (error) {
    return false;
  }
}

