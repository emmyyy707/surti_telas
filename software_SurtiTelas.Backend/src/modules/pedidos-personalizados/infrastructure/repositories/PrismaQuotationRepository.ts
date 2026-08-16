/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, PrismaClient } from '@prisma/client';
import type { QuotationRepository } from '../../domain/repositories/CustomOrderRepository';
import { toCotizacion, toCreateCotizacionInput } from '../mappers/CustomOrderMapper';

export class PrismaQuotationRepository implements QuotationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getByPedidoId(pedidoPersonalizadoId: string) {
    const row = await this.prisma.quotes.findFirst({
      where: { custom_order_id: pedidoPersonalizadoId, deleted_at: null },
      include: { quote_items: true },
    });
    return row ? toCotizacion(row) : null;
  }

  async create(data: any, tx?: any) {
    const prisma = tx ?? this.prisma;
    const row = await prisma.quotes.create({
      data: toCreateCotizacionInput(data) as unknown as Prisma.quotesCreateInput,
      include: { quote_items: true },
    });
    return toCotizacion(row);
  }

  async update(id: string, changes: any, tx?: any) {
    const prisma = tx ?? this.prisma;
    const data: Record<string, unknown> = {};
    if (changes.estado !== undefined) data.estado = changes.estado;
    if (changes.subtotal !== undefined) data.subtotal = changes.subtotal;
    if (changes.impuestos !== undefined) data.impuestos = changes.impuestos;
    if (changes.descuento !== undefined) data.descuento = changes.descuento;
    if (changes.total !== undefined) data.total = changes.total;
    if (changes.tiempoEstimadoDias !== undefined) data.tiempo_estimado_dias = changes.tiempoEstimadoDias;
    if (changes.validaHasta !== undefined) data.valida_hasta = changes.validaHasta;
    if (changes.condicionesPago !== undefined) data.condiciones_pago = changes.condicionesPago;
    if (changes.observaciones !== undefined) data.observaciones = changes.observaciones;
    if (changes.motivoRechazo !== undefined) data.motivo_rechazo = changes.motivoRechazo;
    if (changes.generadoPorId !== undefined) data.generado_por_id = changes.generadoPorId;
    if (changes.generadoPorNombre !== undefined) data.generado_por_nombre = changes.generadoPorNombre;
    if (changes.respondidaEn !== undefined) data.respondida_en = changes.respondidaEn;
    if (changes.negotiationCount !== undefined) data.negotiation_count = changes.negotiationCount;
    if (changes.negotiationHistory !== undefined) data.negotiation_history = changes.negotiationHistory;

    const row = await prisma.quotes.update({
      where: { id },
      data: data as Prisma.quotesUpdateInput,
      include: { quote_items: true },
    });
    return toCotizacion(row);
  }

  async nextNumero(): Promise<string> {
    const last = await this.prisma.quotes.findFirst({
      where: { numero: { startsWith: 'COT-' } },
      orderBy: { createdAt: 'desc' },
      select: { numero: true },
    });
    let seq = 1;
    if (last?.numero) {
      const match = /COT-(\d+)/.exec(last.numero);
      if (match) seq = parseInt(match[1], 10) + 1;
    }
    return `COT-${String(seq).padStart(4, '0')}`;
  }
}
