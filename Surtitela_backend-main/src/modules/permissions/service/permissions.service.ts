import prisma from "../../../config/prisma.js";

export type PermissionPublic = {
  id_permission: number;
  name: string;
  description?: string | null;
  status?: boolean | null;
};

export async function getAllPermissions(): Promise<PermissionPublic[]> {
  return prisma.permissions.findMany();
}

export async function createPermission(data: { name: string; description?: string }): Promise<PermissionPublic | null> {
  try {
    return await prisma.permissions.create({ data });
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function deletePermission(id_permission: number): Promise<boolean> {
  try {
    await prisma.permissions.delete({ where: { id_permission } });
    return true;
  } catch (error) {
    return false;
  }
}

