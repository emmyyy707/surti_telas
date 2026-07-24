import { ProductionStatus as DbStatus } from '@prisma/client';
import type { ProductionOrderData, ProductionStatus } from '../../domain/entities/ProductionOrder';

const STATUS_TO_DB: Record<ProductionStatus, DbStatus> = {
  PENDIENTE: 'PENDIENTE',
  EN_PROCESO: 'EN_PROCESO',
  TERMINADO: 'TERMINADO',
};

const DB_TO_STATUS: Record<DbStatus, ProductionStatus> = {
  PENDIENTE: 'PENDIENTE',
  EN_PROCESO: 'EN_PROCESO',
  TERMINADO: 'TERMINADO',
};

type ProductionOrderRow = {
  id: string;
  pedidoId: string | null;
  operarioId: string | null;
  tallerId: string | null;
  referencia: string;
  cantidad: number;
  fechaInicio: Date;
  fechaEstimada: Date;
  avance: number;
  estado: DbStatus;
  tela: string | null;
  colores: string[];
  curvaTallas: unknown;
  notasTecnicas: string | null;
  pedido?: {
    id: string;
    numero: string;
    clienteNombre: string;
    prioridad: string;
    total: unknown;
    items: Array<{
      nombre: string;
      precio: unknown;
      cantidad: number;
    }>;
  } | null;
};

export function toProductionOrderData(row: ProductionOrderRow): ProductionOrderData {
  const pedido = row.pedido ?? null;
  const primerItem = pedido?.items?.[0];
  return {
    id: row.id,
    pedidoId: row.pedidoId ?? undefined,
    operarioId: row.operarioId ?? undefined,
    tallerId: row.tallerId ?? undefined,
    referencia: row.referencia,
    cantidad: row.cantidad,
    fechaInicio: row.fechaInicio,
    fechaEstimada: row.fechaEstimada,
    avance: row.avance,
    estado: DB_TO_STATUS[row.estado],
    tela: row.tela ?? undefined,
    colores: row.colores,
    curvaTallas: (row.curvaTallas as Record<string, number>) ?? undefined,
    notasTecnicas: row.notasTecnicas ?? undefined,
    pedidoNumero: pedido?.numero,
    pedidoCliente: pedido?.clienteNombre,
    pedidoPrioridad: pedido?.prioridad,
    pedidoItemNombre: primerItem?.nombre,
    pedidoTotal: pedido?.total ? Number(pedido.total) : undefined,
  };
}

export const productionStatusToDb = (status: ProductionStatus): DbStatus => STATUS_TO_DB[status];
export const dbToProductionStatus = (status: DbStatus): ProductionStatus => DB_TO_STATUS[status];
