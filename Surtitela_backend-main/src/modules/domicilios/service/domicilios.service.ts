import prisma from "../../../config/prisma.js";
import { normalizarPrismaEntidad } from "../../../shared/prisma-utils.js";

export type DomicilioPublic = {
  pedidoId: number;
  domiciliarioId?: number | null;
  fechaEntrega?: string | null;
  direccion?: string | null;
  estado?: string;
  horaEntrega?: string | null;
  observaciones?: string | null;
};

function normalizeDomicilio(delivery: any): DomicilioPublic {
  const normalized = normalizarPrismaEntidad(delivery);
  return {
    pedidoId: normalized.id_delivery,
    domiciliarioId: normalized.id_employee,
    fechaEntrega: normalized.delivery_date ? new Date(normalized.delivery_date).toISOString() : null,
    direccion: normalized.address,
    estado: normalized.status ? "Pendiente" : "Completado",
    horaEntrega: null,
    observaciones: normalized.city ? `Ciudad ${normalized.city}` : null,
  };
}

export async function getAllDomicilios(): Promise<DomicilioPublic[]> {
  const deliveries = await prisma.deliveries.findMany();
  return deliveries.map(normalizeDomicilio);
}

export async function getDomicilioById(id_delivery: number): Promise<DomicilioPublic | null> {
  const delivery = await prisma.deliveries.findUnique({ where: { id_delivery } });
  return delivery ? normalizeDomicilio(delivery) : null;
}

export async function getRutaDomicilios(): Promise<DomicilioPublic[]> {
  const deliveries = await prisma.deliveries.findMany();
  return deliveries.map(normalizeDomicilio);
}

export async function getHistorialDomicilios(): Promise<DomicilioPublic[]> {
  const deliveries = await prisma.deliveries.findMany();
  return deliveries.map(normalizeDomicilio);
}

export async function getEntregasByDomiciliario(id_employee: number): Promise<DomicilioPublic[]> {
  const deliveries = await prisma.deliveries.findMany({ where: { id_employee } });
  return deliveries.map(normalizeDomicilio);
}

export async function createDomicilio(data: { id_employee?: number; id_order?: number; address?: string; city?: string; phone?: string; total?: number; status?: boolean }): Promise<DomicilioPublic | null> {
  try {
    const delivery = await prisma.deliveries.create({ data });
    return normalizeDomicilio(delivery);
  } catch (error) {
    console.error("Error creando domicilio:", error);
    return null;
  }
}

export async function updateDomicilio(id_delivery: number, data: { id_employee?: number; address?: string; city?: string; phone?: string; total?: number; status?: boolean }): Promise<DomicilioPublic | null> {
  try {
    const delivery = await prisma.deliveries.update({ where: { id_delivery }, data });
    return normalizeDomicilio(delivery);
  } catch (error) {
    console.error("Error actualizando domicilio:", error);
    return null;
  }
}

export async function deleteDomicilio(id_delivery: number): Promise<boolean> {
  try {
    await prisma.deliveries.delete({ where: { id_delivery } });
    return true;
  } catch (error) {
    return false;
  }
}
