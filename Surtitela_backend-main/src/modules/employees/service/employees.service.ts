import prisma from "../../../config/prisma.js";
import { normalizarPrismaEntidad } from "../../../shared/prisma-utils.js";

export type EmployeePublic = {
  id_employee: number;
  hire_date?: Date | null;
  salary?: number | null;
  status?: boolean | null;
  id_user?: number | null;
};

export async function getAllEmployees(): Promise<EmployeePublic[]> {
  const employees = await prisma.employees.findMany();
  return employees.map((employee) => normalizarPrismaEntidad(employee) as EmployeePublic);
}

export async function createEmployee(data: { hire_date?: Date | string; salary?: number; id_user?: number }): Promise<EmployeePublic | null> {
  try {
    const empData: any = { ...data };
    if (data.hire_date && typeof data.hire_date === 'string') {
      empData.hire_date = new Date(data.hire_date);
    }
    const employee = await prisma.employees.create({ data: empData });
    return normalizarPrismaEntidad(employee) as EmployeePublic;
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function deleteEmployee(id_employee: number): Promise<boolean> {
  try {
    await prisma.employees.delete({ where: { id_employee } });
    return true;
  } catch (error) {
    return false;
  }
}

