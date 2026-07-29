import { Delivery } from '../../domain/entities/Delivery';
import type { DeliveryData } from '../../domain/entities/Delivery';
import type { Prisma } from '@prisma/client';

type DeliveryRow = Prisma.DeliveryGetPayload<{
  include: {
    order: { select: { numero: true; clienteNombre: true } };
    domiciliario: { select: { nombre: true } };
  };
}>;

export function toDelivery(row: DeliveryRow): Delivery {
  return new Delivery({
    id: row.id,
    orderId: row.orderId,
    domiciliarioId: row.domiciliarioId,
    estado: row.estado as Delivery['estado'],
    direccion: row.direccion,
    ciudad: row.ciudad,
    telefono: row.telefono,
    notas: row.notas,
    asignadoEn: row.asignadoEn,
    entregadoEn: row.entregadoEn,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });
}

export function toDeliveryData(row: DeliveryRow): DeliveryData {
  return {
    id: row.id,
    orderId: row.orderId,
    domiciliarioId: row.domiciliarioId,
    estado: row.estado as DeliveryData['estado'],
    direccion: row.direccion,
    ciudad: row.ciudad,
    telefono: row.telefono,
    notas: row.notas,
    asignadoEn: row.asignadoEn,
    entregadoEn: row.entregadoEn,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    orderNumero: row.order?.numero,
    clienteNombre: row.order?.clienteNombre,
    domiciliarioNombre: row.domiciliario?.nombre,
  };
}

export function toUpdateInput(changes: Partial<DeliveryData>): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (changes.domiciliarioId !== undefined) data.domiciliarioId = changes.domiciliarioId ?? null;
  if (changes.estado !== undefined) data.estado = changes.estado;
  if (changes.direccion !== undefined) data.direccion = changes.direccion ?? '';
  if (changes.ciudad !== undefined) data.ciudad = changes.ciudad ?? '';
  if (changes.telefono !== undefined) data.telefono = changes.telefono ?? '';
  if (changes.notas !== undefined) data.notas = changes.notas ?? '';
  if (changes.asignadoEn !== undefined) data.asignadoEn = changes.asignadoEn;
  if (changes.entregadoEn !== undefined) data.entregadoEn = changes.entregadoEn;
  return data;
}
