import prisma from "../../../config/prisma.js";

export type WorkshopPublic = {
  id_workshop: number;
  name: string;
  phone?: string | null;
  address?: string | null;
  status?: boolean | null;
};

export async function getAllWorkshops(): Promise<WorkshopPublic[]> {
  return prisma.workshops.findMany();
}

export async function createWorkshop(data: { name: string; phone?: string; address?: string }): Promise<WorkshopPublic | null> {
  try {
    return await prisma.workshops.create({ data });
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function deleteWorkshop(id_workshop: number): Promise<boolean> {
  try {
    await prisma.workshops.delete({ where: { id_workshop } });
    return true;
  } catch (error) {
    return false;
  }
}

