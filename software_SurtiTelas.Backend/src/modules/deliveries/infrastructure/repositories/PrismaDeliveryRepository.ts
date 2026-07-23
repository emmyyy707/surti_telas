/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma, PrismaClient } from '@prisma/client';
import { Delivery } from '../../domain/entities/Delivery';
import type { DeliveryData, DeliveryFilters, DeliveryListResult, DeliveryRepository } from '../../domain/repositories/DeliveryRepository';
import { toDelivery, toUpdateInput } from '../mappers/DeliveryMapper';

export class PrismaDeliveryRepository implements DeliveryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapRow(r: any): DeliveryData {
    const d = toDelivery(r);
    const dto = d.toDTO() as any;
    dto.orderNumero = r.order_numero;
    dto.clienteNombre = r.order_clienteNombre;
    dto.domiciliarioNombre = r.domiciliario_nombre;
    return dto as DeliveryData;
  }

  async list(filters: DeliveryFilters = {}): Promise<DeliveryListResult> {
    const where: string[] = ['d."deleted_at" IS NULL'];
    const params: any[] = [];
    if (filters.estado) {
      params.push(filters.estado);
      where.push(`d.estado = $${params.length}`);
    }
    if (filters.domiciliarioId) {
      params.push(filters.domiciliarioId);
      where.push(`d.domiciliario_id = $${params.length}`);
    }

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const offset = (page - 1) * limit;
    const whereSql = where.join(' AND ');

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT d.*, o.numero AS "order_numero", o.cliente_nombre AS "order_clienteNombre", u.nombre AS "domiciliario_nombre"
      FROM deliveries d
      LEFT JOIN orders o ON o.id = d.order_id
      LEFT JOIN users u ON u.id = d.domiciliario_id
      WHERE ${Prisma.raw(whereSql)}
      ORDER BY d."createdAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalRow = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(*)::int AS count
      FROM deliveries d
      WHERE ${Prisma.raw(whereSql)}
    `;
    const total = totalRow[0]?.count ?? 0;

    return {
      data: rows.map((r) => this.mapRow(r)),
      meta: { total, page, limit },
    };
  }

  async getById(id: string): Promise<Delivery | null> {
    const row = await this.prisma.delivery.findUnique({
      where: { id },
      include: {
        order: { select: { numero: true, clienteNombre: true } },
        domiciliario: { select: { nombre: true } },
      },
    });
    if (!row || row.deletedAt) return null;

    return toDelivery(row);
  }

  async create(data: DeliveryData): Promise<Delivery> {
    const delivery = new Delivery(data);
    const row = await this.prisma.delivery.create({
      data: {
        orderId: delivery.orderId,
        domiciliarioId: delivery.domiciliarioId ?? undefined,
        estado: delivery.estado,
        direccion: (delivery.direccion ?? '') as string,
        ciudad: (delivery.ciudad ?? '') as string,
        telefono: (delivery.telefono ?? '') as string,
        notas: (delivery.notas ?? '') as string,
        asignadoEn: delivery.asignadoEn ?? undefined,
        entregadoEn: delivery.entregadoEn ?? undefined,
      },
    });
    return toDelivery(row);
  }

  async update(id: string, changes: Partial<DeliveryData>): Promise<Delivery> {
    const data = toUpdateInput(changes) as any;
    const row = await this.prisma.delivery.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return toDelivery(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$executeRaw`UPDATE deliveries SET "deleted_at" = NOW() WHERE id = ${id}`;
  }
}
