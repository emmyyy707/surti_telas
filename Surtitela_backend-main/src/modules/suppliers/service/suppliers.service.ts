import prisma from "../../../config/prisma.js";

export type SupplierPublic = {
  id_supplier: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  status?: boolean | null;
};

export async function getAllSuppliers(): Promise<SupplierPublic[]> {
  return prisma.suppliers.findMany();
}

export async function createSupplier(data: { name: string; phone?: string; email?: string; address?: string }): Promise<SupplierPublic | null> {
  try {
    return await prisma.suppliers.create({ data });
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function deleteSupplier(id_supplier: number): Promise<boolean> {
  try {
    await prisma.suppliers.delete({ where: { id_supplier } });
    return true;
  } catch (error) {
    return false;
  }
}

