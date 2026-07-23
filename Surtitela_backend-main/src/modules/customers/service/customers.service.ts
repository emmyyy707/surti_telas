import prisma from "../../../config/prisma.js";
import { normalizarPrismaEntidad } from "../../../shared/prisma-utils.js";

export type CustomerPublic = {
  id: number;
  nombre: string;
  ciudad?: string | null;
  tel?: string | null;
  email?: string | null;
  asesor?: string | null;
  pedidos?: number;
  estado?: string;
  nit?: string | null;
  notas?: string | null;
  direccion?: string | null;
  tipoCliente?: string | null;
};

function normalizeCustomer(customer: any): CustomerPublic {
  const normalized = normalizarPrismaEntidad(customer);
  const user = normalized.users ?? {};
  return {
    id: normalized.id_customer,
    nombre: `${user.name ?? ""} ${user.last_name ?? ""}`.trim(),
    ciudad: null,
    tel: user.phone,
    email: user.email,
    asesor: null,
    pedidos: Array.isArray(normalized.orders) ? normalized.orders.length : 0,
    estado: normalized.status ? "Activo" : "Inactivo",
    nit: null,
    notas: null,
    direccion: user.address,
    tipoCliente: null,
  };
}

export async function getAllCustomers(): Promise<CustomerPublic[]> {
  const customers = await prisma.customers.findMany({ include: { users: true, orders: true } });
  return customers.map(normalizeCustomer);
}

export async function getCustomers(options: { page: number; limit: number; search?: string }): Promise<{ data: CustomerPublic[]; total: number }> {
  const { page, limit, search } = options;
  const where: any = {};

  if (search) {
    const q = search.trim();
    where.OR = [
      { users: { is: { name: { contains: q, mode: "insensitive" } } } },
      { users: { is: { last_name: { contains: q, mode: "insensitive" } } } },
      { users: { is: { email: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const total = await prisma.customers.count({ where });

  const customers = await prisma.customers.findMany({
    where,
    include: { users: true, orders: true },
    skip: (Math.max(1, page) - 1) * limit,
    take: limit,
  });

  const data = customers.map(normalizeCustomer);
  return { data, total };
}

export async function getCustomerById(id_customer: number): Promise<CustomerPublic | null> {
  const customer = await prisma.customers.findUnique({
    where: { id_customer },
    include: { users: true, orders: true },
  });
  return customer ? normalizeCustomer(customer) : null;
}

export async function createCustomer(data: {
  id_user?: number;
  status?: boolean;
}): Promise<CustomerPublic | null> {
  try {
    const customer = await prisma.customers.create({ data });
    return normalizeCustomer(customer);
  } catch (error) {
    console.error("Error en el servicio:", error);
    return null;
  }
}

export async function updateCustomer(id_customer: number, data: { status?: boolean; id_user?: number }): Promise<CustomerPublic | null> {
  try {
    const customer = await prisma.customers.update({
      where: { id_customer },
      data,
      include: { users: true, orders: true },
    });
    return normalizeCustomer(customer);
  } catch (error) {
    console.error("Error actualizando cliente:", error);
    return null;
  }
}

export async function deleteCustomer(id_customer: number): Promise<boolean> {
  try {
    await prisma.customers.delete({ where: { id_customer } });
    return true;
  } catch (error) {
    return false;
  }
}

