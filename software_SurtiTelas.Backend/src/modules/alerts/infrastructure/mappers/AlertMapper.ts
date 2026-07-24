import type { AlertData, AlertType, AlertPriority, AlertState } from '../../domain/entities/Alert';

type AlertRow = {
  id: string;
  tipo: string;
  modulo: string;
  referenciaId: string | null;
  mensaje: string;
  estado: string;
  prioridad: string;
  leida: boolean;
  leidaPorId: string | null;
  resueltaPorId: string | null;
  resueltaEn: Date | null;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export function toAlertData(row: AlertRow): AlertData {
  return {
    id: row.id,
    tipo: row.tipo as AlertType,
    modulo: row.modulo,
    referenciaId: row.referenciaId ?? undefined,
    mensaje: row.mensaje,
    estado: row.estado as AlertState,
    prioridad: row.prioridad as AlertPriority,
    leida: row.leida,
    leidaPorId: row.leidaPorId ?? undefined,
    resueltaPorId: row.resueltaPorId ?? undefined,
    resueltaEn: row.resueltaEn ?? undefined,
    metadata: (row.metadata as Record<string, unknown>) ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? undefined,
  };
}
