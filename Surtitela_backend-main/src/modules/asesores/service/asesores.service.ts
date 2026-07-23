import prisma from "../../../config/prisma.js";
import { normalizarPrismaEntidad } from "../../../shared/prisma-utils.js";

export type AsesorPublic = {
  id: number;
  nombre?: string | null;
  email?: string | null;
  telefono?: string | null;
  zona?: string | null;
  ventas?: number;
  mesVentas?: number;
  comisiones?: number;
};

function normalizeAsesor(user: any): AsesorPublic {
  const normalized = normalizarPrismaEntidad(user);
  return {
    id: normalized.id_user,
    nombre: `${normalized.name ?? ""} ${normalized.last_name ?? ""}`.trim(),
    email: normalized.email,
    telefono: normalized.phone,
    zona: null,
    ventas: Array.isArray(normalized.customers) ? normalized.customers.reduce((sum: number, customer: any) => sum + (customer.orders?.length ?? 0), 0) : 0,
    mesVentas: 0,
    comisiones: 0,
  };
}

export async function getAllAsesores(): Promise<AsesorPublic[]> {
  const users = await prisma.users.findMany({
    where: { roles: { name: "asesor" } },
    include: { customers: { include: { orders: true } } },
  });
  return users.map(normalizeAsesor);
}

export async function getAsesorById(id_user: number): Promise<AsesorPublic | null> {
  const user = await prisma.users.findUnique({
    where: { id_user },
    include: { customers: { include: { orders: true } } },
  });
  return user ? normalizeAsesor(user) : null;
}

export async function getClientesDeAsesor(id_user: number): Promise<any[]> {
  const customers = await prisma.customers.findMany({ where: { id_user }, include: { users: true } });
  return customers.map((customer) => ({
    id: customer.id_customer,
    nombre: customer.users ? `${customer.users.name} ${customer.users.last_name}`.trim() : null,
    email: customer.users?.email,
    tel: customer.users?.phone,
  }));
}

export async function getPedidosDeAsesor(id_user: number): Promise<any[]> {
  const customers = await prisma.customers.findMany({ where: { id_user }, include: { orders: true } });
  return customers.flatMap((customer) => customer.orders.map((order) => normalizarPrismaEntidad(order)));
}

export async function getComisionesAsesor(id_user: number): Promise<{ totalComisiones: number; detalle: any[] }> {
  const pedidos = await getPedidosDeAsesor(id_user);
  const totalComisiones = pedidos.reduce((sum: number, pedido: any) => sum + ((pedido.total ?? 0) * 0.05), 0);
  return { totalComisiones, detalle: pedidos.map((pedido: any) => ({ id_order: pedido.id_order, total: pedido.total, comision: ((pedido.total ?? 0) * 0.05).toFixed(2) })) };
}
