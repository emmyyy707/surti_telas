import { Prisma, PrismaClient, PurchaseStatus as PrismaPurchaseStatus } from '@prisma/client';
import { NotFoundError } from '../../../../shared/domain/errors';
import { Purchase, PurchaseItem } from '../../domain/entities/Purchase';
import type { PurchaseRepository } from '../../domain/repositories/PurchaseRepository';
import { toPurchaseData, toPurchaseItemData } from '../mappers/PurchaseMapper';

export class PrismaPurchaseRepository implements PurchaseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: { search?: string; proveedorId?: string; estado?: string; page?: number; limit?: number; cursor?: string; sort?: string; order?: string } = {}): Promise<{ data: Purchase[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }> {
    const where: Prisma.PurchaseWhereInput = { deletedAt: null };
    if (filters.search) {
      where.OR = [
        { numero: { contains: filters.search, mode: 'insensitive' } },
        { observaciones: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.proveedorId) where.proveedorId = filters.proveedorId;
    if (filters.estado) where.estado = filters.estado as PrismaPurchaseStatus;

    const limit = filters.limit ?? 50;
    const sort = filters.sort ?? 'fecha';
    const order = filters.order ?? 'desc';
    const orderBy: Prisma.PurchaseOrderByWithRelationInput[] = [{ [sort]: order as Prisma.SortOrder }, { id: order as Prisma.SortOrder }];

    const cursorId = filters.cursor ? Buffer.from(filters.cursor, 'base64').toString('utf-8') : undefined;

    if (cursorId) {
      const cursorWhere: Prisma.PurchaseWhereInput = { ...where, OR: [{ id: order === 'asc' ? { gt: cursorId } : { lt: cursorId } }] };
      const [rows, total] = await this.prisma.$transaction([
        this.prisma.purchase.findMany({ where: cursorWhere, orderBy, take: limit + 1 }),
        this.prisma.purchase.count({ where }),
      ]);
      const hasMore = rows.length > limit;
      const data = hasMore ? rows.slice(0, limit) : rows;
      const nextCursor = hasMore && data.length ? Buffer.from(data[data.length - 1].id).toString('base64') : undefined;
      return { data: data.map((r) => new Purchase(toPurchaseData(r))), meta: { total, page: 1, limit, nextCursor } };
    }

    const page = filters.page ?? 1;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.purchase.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
      this.prisma.purchase.count({ where }),
    ]);
    return { data: rows.map((r) => new Purchase(toPurchaseData(r))), meta: { total, page, limit } };
  }

  async getById(id: string): Promise<Purchase | null> {
    const row = await this.prisma.purchase.findFirst({ where: { id, deletedAt: null } });
    return row ? new Purchase(toPurchaseData(row)) : null;
  }

  async create(input: { numero: string; proveedorId: string; usuarioId: string; total: number; observaciones?: string; items: { rawMaterialId?: string; nombre: string; cantidad: number; precioUnitario: number }[] }): Promise<Purchase> {
    const created = await this.prisma.purchase.create({
      data: {
        numero: input.numero,
        proveedorId: input.proveedorId,
        usuarioId: input.usuarioId,
        total: input.total,
        observaciones: input.observaciones,
        estado: 'PENDIENTE',
      },
    });

    await this.prisma.purchaseItem.createMany({
      data: input.items.map((item) => ({
        purchaseId: created.id,
        rawMaterialId: item.rawMaterialId,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.cantidad * item.precioUnitario,
      })),
    });

    const row = await this.prisma.purchase.findFirst({ where: { id: created.id } });
    if (!row) throw new NotFoundError('Compra no encontrada después de crear');
    return new Purchase(toPurchaseData(row));
  }

  async update(id: string, changes: { observaciones?: string; estado?: string }): Promise<Purchase> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Compra no encontrada');

    const row = await this.prisma.purchase.update({
      where: { id },
      data: {
        observaciones: changes.observaciones,
        estado: changes.estado as PrismaPurchaseStatus,
      },
    });
    return new Purchase(toPurchaseData(row));
  }

  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Compra no encontrada');
    await this.prisma.purchase.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getItems(purchaseId: string): Promise<PurchaseItem[]> {
    const rows = await this.prisma.purchaseItem.findMany({ where: { purchaseId, deletedAt: null } });
    return rows.map((r) => new PurchaseItem(toPurchaseItemData(r)));
  }

  async addItem(purchaseId: string, item: { rawMaterialId?: string; nombre: string; cantidad: number; precioUnitario: number }): Promise<PurchaseItem> {
    const existing = await this.getById(purchaseId);
    if (!existing) throw new NotFoundError('Compra no encontrada');

    const row = await this.prisma.purchaseItem.create({
      data: {
        purchaseId,
        rawMaterialId: item.rawMaterialId,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.cantidad * item.precioUnitario,
      },
    });

    const totalItems = await this.prisma.purchaseItem.findMany({ where: { purchaseId, deletedAt: null } });
    const newTotal = totalItems.reduce((sum, i) => sum + Number(i.subtotal), 0);
    await this.prisma.purchase.update({ where: { id: purchaseId }, data: { total: newTotal } });

    return new PurchaseItem(toPurchaseItemData(row));
  }

  async removeItem(itemId: string): Promise<void> {
    const item = await this.prisma.purchaseItem.findFirst({ where: { id: itemId } });
    if (!item) throw new NotFoundError('Ítem de compra no encontrado');

    await this.prisma.purchaseItem.update({ where: { id: itemId }, data: { deletedAt: new Date() } });

    const totalItems = await this.prisma.purchaseItem.findMany({ where: { purchaseId: item.purchaseId, deletedAt: null } });
    const newTotal = totalItems.reduce((sum, i) => sum + Number(i.subtotal), 0);
    await this.prisma.purchase.update({ where: { id: item.purchaseId }, data: { total: newTotal } });
  }

  async getProveedorNombre(proveedorId: string): Promise<string> {
    const supplier = await this.prisma.supplier.findFirst({ where: { id: proveedorId }, select: { nombre: true } });
    return supplier?.nombre ?? proveedorId;
  }

  async getUsuarioNombre(usuarioId: string): Promise<string> {
    const user = await this.prisma.user.findFirst({ where: { id: usuarioId }, select: { nombre: true } });
    return user?.nombre ?? usuarioId;
  }
}
