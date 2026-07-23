import prisma from "../../../config/prisma.js";
import { normalizarPrismaEntidad } from "../../../shared/prisma-utils.js";
import { usersService } from "../../users/service/users.service.js";

export type DomiciliarioPublic = {
  id: number;
  nombre?: string | null;
  email?: string | null;
  tel?: string | null;
  zona?: string | null;
  entregas?: number;
  estado?: string;
};

function normalizeDomiciliario(employee: any): DomiciliarioPublic {
  const normalized = normalizarPrismaEntidad(employee);
  const user = normalized.users ?? {};
  return {
    id: normalized.id_employee,
    nombre: `${user.name ?? ""} ${user.last_name ?? ""}`.trim(),
    email: user.email,
    tel: user.phone,
    zona: normalized.status ? "Zona asignada" : null,
    entregas: Array.isArray(normalized.deliveries) ? normalized.deliveries.length : 0,
    estado: normalized.status ? "Activo" : "Inactivo",
  };
}

export async function getAllDomiciliarios(): Promise<DomiciliarioPublic[]> {
  const employees = await prisma.employees.findMany({ include: { users: true, deliveries: true } });
  return employees.map(normalizeDomiciliario);
}

export async function getDomiciliarioById(id_employee: number): Promise<DomiciliarioPublic | null> {
  const employee = await prisma.employees.findUnique({ where: { id_employee }, include: { users: true, deliveries: true } });
  return employee ? normalizeDomiciliario(employee) : null;
}

export async function createDomiciliario(data: { nombre: string; email: string; password: string; phone?: string; address?: string; status?: boolean }): Promise<DomiciliarioPublic | null> {
  try {
    const roleId = await usersService.ensureRoleByName("domiciliario");
    const names = data.nombre.trim().split(" ");
    const name = names.shift() || data.nombre;
    const last_name = names.join(" ") || "";
    const user = await usersService.createUser({ name, last_name, email: data.email, password: data.password, phone: data.phone, address: data.address, id_role: roleId });
    if (!user) return null;
    const employee = await prisma.employees.create({ data: { id_user: user.id_user, status: data.status ?? true } });
    return normalizeDomiciliario(await prisma.employees.findUnique({ where: { id_employee: employee.id_employee }, include: { users: true, deliveries: true } }));
  } catch (error) {
    console.error("Error creando domiciliario:", error);
    return null;
  }
}

export async function updateDomiciliario(id_employee: number, data: { status?: boolean; phone?: string | null; address?: string | null }): Promise<DomiciliarioPublic | null> {
  try {
    const employee = await prisma.employees.update({ where: { id_employee }, data: { status: data.status } });
    if (!employee) return null;
    if (data.phone !== undefined || data.address !== undefined) {
      await prisma.users.update({ where: { id_user: employee.id_user! }, data: { phone: data.phone, address: data.address } });
    }
    return getDomiciliarioById(id_employee);
  } catch (error) {
    console.error("Error actualizando domiciliario:", error);
    return null;
  }
}

export async function deleteDomiciliario(id_employee: number): Promise<boolean> {
  try {
    await prisma.employees.delete({ where: { id_employee } });
    return true;
  } catch (error) {
    return false;
  }
}
