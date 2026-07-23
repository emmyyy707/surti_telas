import prisma from "../../../config/prisma.js";

export type ReturnPublic = {
  id_return: number;
  return_date: Date;
  reason?: string | null;
  status?: boolean | null;
  id_order?: number | null;
};

export async function getAllReturns(): Promise<ReturnPublic[]> {
  return prisma.returns.findMany();
}

export async function createReturn(data: { return_date: Date | string; reason?: string; id_order?: number }): Promise<ReturnPublic | null> {
  try {
    const retData: any = { ...data };
    if (typeof data.return_date === 'string') {
      retData.return_date = new Date(data.return_date);
    }
    return await prisma.returns.create({ data: retData });
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function deleteReturn(id_return: number): Promise<boolean> {
  try {
    await prisma.returns.delete({ where: { id_return } });
    return true;
  } catch (error) {
    return false;
  }
}

