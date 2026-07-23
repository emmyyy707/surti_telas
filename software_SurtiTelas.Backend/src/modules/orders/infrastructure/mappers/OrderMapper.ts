import { OrderPriority as DbPriority, OrderStatus as DbStatus } from '@prisma/client';
import type { OrderData, OrderItem, OrderPriority, OrderStatus } from '../../domain/entities/Order';

const STATUS_TO_DB: Record<OrderStatus, DbStatus> = {
  Nuevo: 'NUEVO',
  'En producción': 'EN_PRODUCCION',
  Listo: 'LISTO',
  Despachado: 'DESPACHADO',
  'En camino': 'EN_CAMINO',
  Entregado: 'ENTREGADO',
  Cancelado: 'CANCELADO',
};

const DB_TO_STATUS: Record<DbStatus, OrderStatus> = {
  NUEVO: 'Nuevo',
  EN_PRODUCCION: 'En producción',
  LISTO: 'Listo',
  DESPACHADO: 'Despachado',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

const PRIORITY_TO_DB: Record<OrderPriority, DbPriority> = {
  Estándar: 'ESTANDAR',
  Prioritario: 'PRIORITARIO',
};

const DB_TO_PRIORITY: Record<DbPriority, OrderPriority> = {
  ESTANDAR: 'Estándar',
  PRIORITARIO: 'Prioritario',
};

type OrderRow = {
  id: string;
  numero: string;
  clienteId: string;
  cliente: { nombre: string };
  clienteNombre: string;
  asesorId: string;
  asesor: { nombre: string };
  asesorNombre: string;
  fecha: Date;
  total: { toNumber(): number };
  itemsCount: number;
  estado: DbStatus;
  prioridad: DbPriority;
  observaciones: string | null;
  items: Array<{ productId: string | null; nombre: string; precio: { toNumber(): number }; cantidad: number }>;
  createdAt: Date;
  updatedAt: Date;
};

export function toOrderData(row: OrderRow): OrderData {
  return {
    id: row.id,
    numero: row.numero,
    cliente: row.clienteNombre || row.cliente?.nombre || '',
    asesor: row.asesorNombre || row.asesor?.nombre || '',
    fecha: row.fecha.toISOString(),
    items: row.itemsCount,
    total: Number(row.total.toNumber()),
    estado: DB_TO_STATUS[row.estado],
    prioridad: DB_TO_PRIORITY[row.prioridad],
    observaciones: row.observaciones ?? undefined,
    itemsList: row.items.map(
      (i): OrderItem => ({
        productId: i.productId ?? undefined,
        nombre: i.nombre,
        precio: i.precio.toNumber(),
        cantidad: i.cantidad,
      })
    ),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const orderStatusToDb = (status: OrderStatus): DbStatus => STATUS_TO_DB[status];
export const dbToOrderStatus = (status: DbStatus): OrderStatus => DB_TO_STATUS[status];
export const orderPriorityToDb = (priority: OrderPriority): DbPriority => PRIORITY_TO_DB[priority];
