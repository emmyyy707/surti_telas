/* eslint-disable @typescript-eslint/no-explicit-any */
import { Return, type ReturnData } from '../../domain/entities/Return';

export function toReturnData(row: any): ReturnData {
  const order = row.order ?? null;
  return {
    id: row.id,
    numeroDevolucion: row.numeroDevolucion,
    orderId: row.orderId,
    prenda: row.prenda,
    referencia: row.referencia,
    motivo: row.motivo,
    cantidad: row.cantidad,
    cantidadInspeccionada: row.cantidadInspeccionada,
    fechaDevolucion: row.fechaDevolucion,
    estado: row.estado,
    destino: row.destino,
    cliente: row.cliente,
    clienteId: row.clienteId,
    responsable: row.responsable,
    observaciones: row.observaciones,
    imagenes: row.imagenes ?? [],
    numeroOrden: order?.numero ?? null,
    fechaOrden: order?.fecha ?? null,
    estadoOrden: order?.estado ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toReturn(row: any): Return {
  return new Return(toReturnData(row));
}

export function toCreateInput(d: Return) {
  return {
    numeroDevolucion: d.numeroDevolucion,
    orderId: d.orderId,
    prenda: d.prenda,
    referencia: d.referencia,
    motivo: d.motivo,
    cantidad: d.cantidad,
    cantidadInspeccionada: d.cantidadInspeccionada,
    fechaDevolucion: d.fechaDevolucion,
    estado: d.estado,
    destino: d.destino,
    cliente: d.cliente,
    clienteId: d.clienteId,
    responsable: d.responsable,
    observaciones: d.observaciones,
    imagenes: d.imagenes,
  };
}

export function toUpdateInput(changes: Partial<ReturnData>) {
  const data: Record<string, unknown> = {};
  if (changes.prenda !== undefined) data.prenda = changes.prenda;
  if (changes.referencia !== undefined) data.referencia = changes.referencia;
  if (changes.motivo !== undefined) data.motivo = changes.motivo;
  if (changes.cantidad !== undefined) data.cantidad = changes.cantidad;
  if (changes.cantidadInspeccionada !== undefined) data.cantidadInspeccionada = changes.cantidadInspeccionada;
  if (changes.estado !== undefined) data.estado = changes.estado;
  if (changes.destino !== undefined) data.destino = changes.destino;
  if (changes.cliente !== undefined) data.cliente = changes.cliente;
  if (changes.clienteId !== undefined) data.clienteId = changes.clienteId;
  if (changes.responsable !== undefined) data.responsable = changes.responsable;
  if (changes.observaciones !== undefined) data.observaciones = changes.observaciones;
  if (changes.imagenes !== undefined) data.imagenes = changes.imagenes;
  return data;
}

