import { Sale } from '../../domain/entities/Sale';
import type { SaleData } from '../../domain/entities/Sale';

type SaleRow = {
  id: string;
  orderId: string;
  clienteId: string;
  clienteNombre: string;
  asesorId: string;
  asesorNombre: string;
  fechaVenta: Date;
  subtotal: { toNumber(): number };
  impuestos: { toNumber(): number };
  descuentos: { toNumber(): number };
  total: { toNumber(): number };
  estado: string;
  motivoAnulacion: string | null;
  medioPago: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toSaleData(row: SaleRow): SaleData {
  return {
    id: row.id,
    orderId: row.orderId,
    clienteId: row.clienteId,
    clienteNombre: row.clienteNombre,
    asesorId: row.asesorId,
    asesorNombre: row.asesorNombre,
    fechaVenta: row.fechaVenta.toISOString(),
    subtotal: Number(row.subtotal.toNumber()),
    impuestos: Number(row.impuestos.toNumber()),
    descuentos: Number(row.descuentos.toNumber()),
    total: Number(row.total.toNumber()),
    estado: row.estado,
    motivoAnulacion: row.motivoAnulacion ?? undefined,
    medioPago: row.medioPago ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toSale(row: SaleRow): Sale {
  return new Sale(toSaleData(row));
}
