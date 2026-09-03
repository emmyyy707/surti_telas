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
  paymentId?: string | null;
  tipoPago?: string | null;
  numeroCuota?: number | null;
  totalCuotas?: number | null;
  esAnticipo?: boolean | null;
  esSaldo?: boolean | null;
  paymentStatus?: string | null;
  comprobantePagoUrl?: string | null;
  registradoPorId?: string | null;
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
    paymentId: row.paymentId ?? null,
    tipoPago: row.tipoPago ?? null,
    numeroCuota: row.numeroCuota ?? null,
    totalCuotas: row.totalCuotas ?? null,
    esAnticipo: row.esAnticipo ?? null,
    esSaldo: row.esSaldo ?? null,
    paymentStatus: row.paymentStatus ?? null,
    comprobantePagoUrl: row.comprobantePagoUrl ?? null,
    registradoPorId: row.registradoPorId ?? null,
  };
}

export function toSale(row: SaleRow): Sale {
  return new Sale(toSaleData(row));
}
