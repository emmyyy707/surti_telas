import { OrderHistory } from '../../domain/entities/OrderHistory';
import type { OrderHistoryData } from '../../domain/entities/OrderHistory';

type OrderHistoryRow = {
  id: string;
  pedidoId: string;
  usuarioId: string | null;
  usuario?: { nombre: string } | null;
  accion: string;
  estadoAnterior: string;
  estadoNuevo: string;
  razon: string | null;
  informacion: Record<string, unknown> | null;
  createdAt: Date;
};

export function toOrderHistoryData(row: OrderHistoryRow): OrderHistoryData {
  return {
    id: row.id,
    pedidoId: row.pedidoId,
    usuarioId: row.usuarioId ?? undefined,
    usuarioNombre: row.usuario?.nombre,
    accion: row.accion,
    estadoAnterior: row.estadoAnterior,
    estadoNuevo: row.estadoNuevo,
    razon: row.razon ?? undefined,
    informacion: row.informacion ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toOrderHistory(row: OrderHistoryRow): OrderHistory {
  return new OrderHistory(toOrderHistoryData(row));
}
