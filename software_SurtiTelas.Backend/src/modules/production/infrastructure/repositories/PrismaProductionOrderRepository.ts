import { Prisma, PrismaClient } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../../../../shared/domain/errors';
import { ProductionOrder, type ProductionStatus } from '../../domain/entities/ProductionOrder';
import type {
  CreateProductionOrderInput,
  ProductionOrderFilters,
  ProductionOrderRepository,
  UpdateProductionOrderInput,
} from '../../domain/repositories/ProductionOrderRepository';
import { productionStatusToDb, toProductionOrderData } from '../mappers/ProductionOrderMapper';

const include = {
  taller: true,
  operario: true,
  pedido: {
    select: {
      id: true,
      numero: true,
      clienteNombre: true,
      prioridad: true,
      total: true,
      items: {
        select: {
          nombre: true,
          precio: true,
          cantidad: true,
        },
        take: 1,
      },
    },
  },
} satisfies Prisma.ProductionOrderInclude;

export class PrismaProductionOrderRepository implements ProductionOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: ProductionOrderFilters = {}): Promise<{ data: ProductionOrder[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }> {
    const where: Prisma.ProductionOrderWhereInput = { deletedAt: null };
    if (filters.estado) where.estado = productionStatusToDb(filters.estado);
    if (filters.tallerId) where.tallerId = filters.tallerId;
    if (filters.operarioId) where.operarioId = filters.operarioId;
    if (filters.pedidoId) where.pedidoId = filters.pedidoId;

    const limit = filters.limit ?? 50;
    const sort = filters.sort ?? 'fechaInicio';
    const order = filters.order ?? 'desc';
    const orderBy: Prisma.ProductionOrderOrderByWithRelationInput[] = [{ [sort]: order }, { id: order }];

    const cursorId = filters.cursor ? Buffer.from(filters.cursor, 'base64').toString('utf-8') : undefined;

    if (cursorId) {
      const cursorWhere: Prisma.ProductionOrderWhereInput = {
        ...where,
        OR: [
          { id: order === 'asc' ? { gt: cursorId } : { lt: cursorId } },
        ],
      };

      const [rows, total] = await this.prisma.$transaction([
        this.prisma.productionOrder.findMany({
          where: cursorWhere,
          include,
          orderBy,
          take: limit + 1,
        }),
        this.prisma.productionOrder.count({ where }),
      ]);

      const hasMore = rows.length > limit;
      const data = hasMore ? rows.slice(0, limit) : rows;
      const nextCursor = hasMore && data.length ? Buffer.from(data[data.length - 1].id).toString('base64') : undefined;

      return {
        data: data.map((r) => new ProductionOrder(toProductionOrderData(r))),
        meta: { total, page: 1, limit, nextCursor },
      };
    }

    const page = filters.page ?? 1;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.productionOrder.findMany({
        where,
        include,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.productionOrder.count({ where }),
    ]);

    return {
      data: rows.map((r) => new ProductionOrder(toProductionOrderData(r))),
      meta: { total, page, limit },
    };
  }

  async getById(id: string): Promise<ProductionOrder | null> {
    const row = await this.prisma.productionOrder.findFirst({ where: { id, deletedAt: null }, include });
    return row ? new ProductionOrder(toProductionOrderData(row)) : null;
  }

  async create(input: CreateProductionOrderInput): Promise<ProductionOrder> {
    const row = await this.prisma.productionOrder.create({
      data: {
        pedidoId: input.pedidoId,
        operarioId: input.operarioId,
        tallerId: input.tallerId,
        referencia: input.referencia,
        cantidad: input.cantidad,
        fechaInicio: input.fechaInicio ?? new Date(),
        fechaEstimada: input.fechaEstimada,
        avance: input.avance ?? 0,
        estado: input.estado ? productionStatusToDb(input.estado) : 'PENDIENTE',
        tela: input.tela,
        colores: input.colores ?? [],
        curvaTallas: input.curvaTallas ?? undefined,
        notasTecnicas: input.notasTecnicas,
      },
      include,
    });
    return new ProductionOrder(toProductionOrderData(row));
  }

  async update(id: string, changes: UpdateProductionOrderInput): Promise<ProductionOrder> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Orden de producción no encontrada');

    const data: Record<string, unknown> = {};
    if (changes.operarioId !== undefined) data.operarioId = changes.operarioId;
    if (changes.tallerId !== undefined) data.tallerId = changes.tallerId;
    if (changes.avance !== undefined) data.avance = changes.avance;
    if (changes.estado !== undefined) data.estado = productionStatusToDb(changes.estado);
    if (changes.tela !== undefined) data.tela = changes.tela;
    if (changes.colores !== undefined) data.colores = changes.colores;
    if (changes.curvaTallas !== undefined) data.curvaTallas = changes.curvaTallas;
    if (changes.notasTecnicas !== undefined) data.notasTecnicas = changes.notasTecnicas;
    if (changes.referencia !== undefined) data.referencia = changes.referencia;
    if (changes.cantidad !== undefined) data.cantidad = changes.cantidad;
    if (changes.fechaEstimada !== undefined) data.fechaEstimada = new Date(changes.fechaEstimada);

    const row = await this.prisma.productionOrder.update({
      where: { id },
      data,
      include,
    });
    return new ProductionOrder(toProductionOrderData(row));
  }

  async assignToWorkshop(id: string, tallerId: string): Promise<ProductionOrder> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Orden de producción no encontrada');

    const taller = await this.prisma.workshop.findFirst({ where: { id: tallerId, deletedAt: null } });
    if (!taller) throw new BadRequestError('Taller no válido');

    const row = await this.prisma.productionOrder.update({
      where: { id },
      data: { tallerId },
      include,
    });
    return new ProductionOrder(toProductionOrderData(row));
  }

  async updateProgress(id: string, avance: number): Promise<ProductionOrder> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Orden de producción no encontrada');

    if (!existing.avanceValido(avance)) {
      throw new BadRequestError('El avance debe estar entre 0 y 100');
    }

    const nextEstado: ProductionStatus = avance === 100 ? 'TERMINADO' : avance > 0 ? 'EN_PROCESO' : existing.estado;

    const row = await this.prisma.productionOrder.update({
      where: { id },
      data: { avance, estado: productionStatusToDb(nextEstado) },
      include,
    });
    return new ProductionOrder(toProductionOrderData(row));
  }

  async complete(id: string): Promise<ProductionOrder> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Orden de producción no encontrada');

    if (!existing.puedeTerminar()) {
      throw new BadRequestError('La orden debe tener avance 100 para completarse');
    }

    const row = await this.prisma.productionOrder.update({
      where: { id },
      data: { estado: 'TERMINADO', avance: 100 },
      include,
    });
    return new ProductionOrder(toProductionOrderData(row));
  }

  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Orden de producción no encontrada');
    await this.prisma.productionOrder.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
