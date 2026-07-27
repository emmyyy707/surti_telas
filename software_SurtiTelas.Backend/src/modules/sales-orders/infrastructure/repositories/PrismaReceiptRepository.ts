import { PrismaClient } from '@prisma/client';
import type { Receipt } from '../../../receipts/domain/entities/Receipt';
import type { ReceiptRepository } from '../../../receipts/domain/repositories/ReceiptRepository';

export class PrismaReceiptRepository implements ReceiptRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: { customerId?: string; orderId?: string }): Promise<Receipt[]> {
    const where: Record<string, unknown> = { deletedAt: null };
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.orderId) where.orderId = filters.orderId;

    const rows = await this.prisma.receipt.findMany({
      where,
      orderBy: { emitidoAt: 'desc' },
    });

    return rows.map((row) => ({
      id: row.id,
      orderId: row.orderId ?? undefined,
      customerId: row.customerId,
      numero: row.numero,
      total: Number(row.total),
      concepto: row.concepto,
      notas: row.notas ?? undefined,
      url: row.url ?? undefined,
      emitidoPor: row.emitidoPor ?? undefined,
      emitidoAt: row.emitidoAt,
      estado: row.estado,
      estadoEnvio: row.estadoEnvio,
      fechaEnvio: row.fechaEnvio,
      intentosEnvio: row.intentosEnvio,
      ultimoErrorEnvio: row.ultimoErrorEnvio ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })) as unknown as Receipt[];
  }

  async getById(id: string): Promise<Receipt | null> {
    const row = await this.prisma.receipt.findFirst({
      where: { id, deletedAt: null },
    });

    if (!row) return null;
    return {
      id: row.id,
      orderId: row.orderId ?? undefined,
      customerId: row.customerId,
      numero: row.numero,
      total: Number(row.total),
      concepto: row.concepto,
      notas: row.notas ?? undefined,
      url: row.url ?? undefined,
      emitidoPor: row.emitidoPor ?? undefined,
      emitidoAt: row.emitidoAt,
      estado: row.estado,
      estadoEnvio: row.estadoEnvio,
      fechaEnvio: row.fechaEnvio,
      intentosEnvio: row.intentosEnvio,
      ultimoErrorEnvio: row.ultimoErrorEnvio ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as unknown as Receipt;
  }

  async findByOrderId(orderId: string): Promise<Receipt | null> {
    const row = await this.prisma.receipt.findFirst({
      where: { orderId, deletedAt: null },
    });

    if (!row) return null;
    return {
      id: row.id,
      orderId: row.orderId ?? undefined,
      customerId: row.customerId,
      numero: row.numero,
      total: Number(row.total),
      concepto: row.concepto,
      notas: row.notas ?? undefined,
      url: row.url ?? undefined,
      emitidoPor: row.emitidoPor ?? undefined,
      emitidoAt: row.emitidoAt,
      estado: row.estado,
      estadoEnvio: row.estadoEnvio,
      fechaEnvio: row.fechaEnvio,
      intentosEnvio: row.intentosEnvio,
      ultimoErrorEnvio: row.ultimoErrorEnvio ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as unknown as Receipt;
  }

  async create(input: { orderId?: string; customerId: string; numero: string; total: number; concepto: string; notas?: string; emitidoPor?: string }): Promise<Receipt> {
    const row = await this.prisma.receipt.create({
      data: {
        orderId: input.orderId,
        customerId: input.customerId,
        numero: input.numero,
        total: input.total,
        concepto: input.concepto,
        notas: input.notas,
        emitidoPor: input.emitidoPor,
        estado: 'BORRADOR',
      },
    });

    return {
      id: row.id,
      orderId: row.orderId ?? undefined,
      customerId: row.customerId,
      numero: row.numero,
      total: Number(row.total),
      concepto: row.concepto,
      notas: row.notas ?? undefined,
      emitidoPor: row.emitidoPor ?? undefined,
      emitidoAt: row.emitidoAt,
      estado: row.estado,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as unknown as Receipt;
  }

  async update(id: string, data: { url?: string; estado?: string; estadoEnvio?: string; fechaEnvio?: Date; intentosEnvio?: number; ultimoErrorEnvio?: string }): Promise<Receipt> {
    const row = await this.prisma.receipt.update({
      where: { id },
      data: {
        url: data.url,
        estado: data.estado as unknown as string,
        estadoEnvio: data.estadoEnvio as unknown as string,
        fechaEnvio: data.fechaEnvio,
        intentosEnvio: data.intentosEnvio,
        ultimoErrorEnvio: data.ultimoErrorEnvio,
      },
    });

    return {
      id: row.id,
      orderId: row.orderId ?? undefined,
      customerId: row.customerId,
      numero: row.numero,
      total: Number(row.total),
      concepto: row.concepto,
      notas: row.notas ?? undefined,
      url: row.url ?? undefined,
      emitidoPor: row.emitidoPor ?? undefined,
      emitidoAt: row.emitidoAt,
      estado: row.estado,
      estadoEnvio: row.estadoEnvio,
      fechaEnvio: row.fechaEnvio,
      intentosEnvio: row.intentosEnvio,
      ultimoErrorEnvio: row.ultimoErrorEnvio ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    } as unknown as Receipt;
  }
}
