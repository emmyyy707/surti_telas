import prisma from "../../../config/prisma.js";

export type RolePublic = {
  id_role: number;
  name: string;
  description?: string | null;
  status?: boolean | null;
  id_permission?: number | null;
};

export async function getAllRoles(): Promise<RolePublic[]> {
  return prisma.roles.findMany();
}

export async function createRole(data: { name: string; description?: string; id_permission?: number }): Promise<RolePublic | null> {
  try {
    return await prisma.roles.create({ data });
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function deleteRole(id_role: number): Promise<boolean> {
  try {
    await prisma.roles.delete({ where: { id_role } });
    return true;
  } catch (error) {
    return false;
  }
}

