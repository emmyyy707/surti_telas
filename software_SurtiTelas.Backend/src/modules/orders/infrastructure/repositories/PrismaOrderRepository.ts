import { Prisma, PrismaClient } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../../../../shared/domain/errors';
import { Order, type OrderItem, type OrderPriority, type OrderStatus } from '../../domain/entities/Order';
import type { OrderFilters, OrderRepository, CreateOrderInput } from '../../domain/repositories/OrderRepository';
import { orderPriorityToDb, orderStatusToDb, toOrderData } from '../mappers/OrderMapper';

const include = {
  cliente: true,
  asesor: true,
  items: true,
} satisfies Prisma.OrderInclude;

type PrismaCustomer = {
  direccion?: string | null;
  direccionEnvio?: string | null;
  ciudad?: string | null;
  nombre?: string | null;
};

export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: OrderFilters = {}): Promise<{ data: Order[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }> {
    const where: Prisma.OrderWhereInput = { deletedAt: null };
    if (filters.estado) where.estado = orderStatusToDb(filters.estado);
    if (filters.clienteId) where.clienteId = filters.clienteId;
    if (filters.asesorId) where.asesorId = filters.asesorId;
    if (filters.desde || filters.hasta) {
      where.fecha = {};
      if (filters.desde) where.fecha.gte = new Date(filters.desde);
      if (filters.hasta) where.fecha.lte = new Date(filters.hasta);
    }

    const limit = filters.limit ?? 50;
    const sort = filters.sort ?? 'fecha';
    const order = filters.order ?? 'desc';
    const orderBy: Prisma.OrderOrderByWithRelationInput[] = [{ [sort]: order }, { id: order }];

    const cursorId = filters.cursor ? Buffer.from(filters.cursor, 'base64').toString('utf-8') : undefined;

    if (cursorId) {
      const cursorWhere: Prisma.OrderWhereInput = {
        ...where,
        OR: [
          { id: order === 'asc' ? { gt: cursorId } : { lt: cursorId } },
        ],
      };

      const [rows, total] = await this.prisma.$transaction([
        this.prisma.order.findMany({
          where: cursorWhere,
          include,
          orderBy,
          take: limit + 1,
        }),
        this.prisma.order.count({ where }),
      ]);

      const hasMore = rows.length > limit;
      const data = hasMore ? rows.slice(0, limit) : rows;
      const nextCursor = hasMore && data.length ? Buffer.from(data[data.length - 1].id).toString('base64') : undefined;

      return {
        data: data.map((r) => new Order(toOrderData(r))),
        meta: { total, page: 1, limit, nextCursor },
      };
    }

    const page = filters.page ?? 1;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        include,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: rows.map((r) => new Order(toOrderData(r))),
      meta: { total, page, limit },
    };
  }

  async getById(id: string): Promise<Order | null> {
    const row = await this.prisma.order.findFirst({ where: { id, deletedAt: null }, include });
    return row ? new Order(toOrderData(row)) : null;
  }

  async create(input: CreateOrderInput): Promise<Order> {
    const customer = await this.prisma.customer.findFirst({
      where: { id: input.clienteId, deletedAt: null },
    });
    if (!customer) throw new BadRequestError('Cliente no encontrado');

    const asesor = await this.prisma.user.findFirst({ where: { id: input.asesorId, deletedAt: null } });
    if (!asesor) throw new BadRequestError('Asesor no encontrado');

    const itemsList = input.itemsList ?? [];
    const itemsCount = itemsList.reduce((sum, i) => sum + i.cantidad, 0);
    const total = itemsList.reduce((sum, i) => sum + i.precio * i.cantidad, 0);

    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('order_number'))`;

      const lastOrder = await tx.order.findFirst({
        orderBy: { numero: 'desc' },
        select: { numero: true },
      });
      const lastNum = lastOrder ? parseInt(lastOrder.numero.replace('PED-', ''), 10) : 0;
      const numero = `PED-${(lastNum + 1).toString().padStart(6, '0')}`;

      const row = await tx.order.create({
        data: {
          numero,
          clienteId: input.clienteId,
          clienteNombre: customer.nombre,
          asesorId: input.asesorId,
          asesorNombre: asesor.nombre,
          fecha: input.fecha ? new Date(input.fecha) : new Date(),
          total,
          itemsCount,
          estado: orderStatusToDb('Nuevo'),
          prioridad: input.prioridad ? orderPriorityToDb(input.prioridad) : 'ESTANDAR',
          observaciones: input.observaciones,
          items: {
            create: itemsList.map((i) => ({
              productId: i.productId,
              nombre: i.nombre,
              precio: i.precio,
              cantidad: i.cantidad,
            })),
          },
        },
        include,
      });

      return new Order(toOrderData(row));
    });
  }

  async updateStatus(id: string, estado: OrderStatus): Promise<Order> {
    const existing = await this.prisma.order.findFirst({ where: { id, deletedAt: null }, include });
    if (!existing) throw new NotFoundError('Pedido no encontrado');

    const order = new Order(toOrderData(existing));
    if (!order.canTransitionTo(estado)) {
      throw new BadRequestError(`Transición no permitida de "${order.estado}" a "${estado}"`);
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { estado: orderStatusToDb(estado) },
      include,
    });
    return new Order(toOrderData(updated));
  }

  async assignDomiciliario(id: string, domiciliarioId: string): Promise<Order> {
    const existing = await this.prisma.order.findFirst({ where: { id, deletedAt: null }, include });
    if (!existing) throw new NotFoundError('Pedido no encontrado');

    const domiciliario = await this.prisma.user.findFirst({
      where: { id: domiciliarioId, role: 'DOMICILIARIO', deletedAt: null },
    });
    if (!domiciliario) throw new BadRequestError('Domiciliario no válido');

    const customer = existing.cliente as unknown as PrismaCustomer | null;

    await this.prisma.delivery.upsert({
      where: { orderId: id },
      update: {
        domiciliarioId,
        estado: 'ASIGNADO',
      },
      create: {
        orderId: id,
        domiciliarioId,
        estado: 'ASIGNADO',
        direccion: customer?.direccion || customer?.direccionEnvio || '',
        ciudad: customer?.ciudad || '',
      },
    });

    const updated = await this.prisma.order.findFirst({ where: { id, deletedAt: null }, include });
    if (!updated) throw new NotFoundError('Pedido no encontrado');
    return new Order(toOrderData(updated));
  }

  async updateFull(id: string, changes: { clienteId?: string; asesorId?: string; prioridad?: OrderPriority; observaciones?: string; itemsList?: OrderItem[] }): Promise<Order> {
    const existing = await this.prisma.order.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundError('Pedido no encontrado');

    const data: Record<string, unknown> = {};
    if (changes.clienteId) {
      const customer = await this.prisma.customer.findFirst({ where: { id: changes.clienteId, deletedAt: null } });
      if (!customer) throw new BadRequestError('Cliente no encontrado');
      data.clienteId = changes.clienteId;
      data.clienteNombre = customer.nombre;
    }
    if (changes.asesorId) {
      const asesor = await this.prisma.user.findFirst({ where: { id: changes.asesorId, deletedAt: null } });
      if (!asesor) throw new BadRequestError('Asesor no encontrado');
      data.asesorId = changes.asesorId;
      data.asesorNombre = asesor.nombre;
    }
    if (changes.prioridad) data.prioridad = orderPriorityToDb(changes.prioridad);
    if (changes.observaciones !== undefined) data.observaciones = changes.observaciones;

    const updated = await this.prisma.order.update({
      where: { id },
      data,
      include,
    });

    if (changes.itemsList) {
      await this.prisma.orderItem.deleteMany({ where: { orderId: id } });
      const total = changes.itemsList.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
      const itemsCount = changes.itemsList.reduce((sum, i) => sum + i.cantidad, 0);
      await this.prisma.order.update({
        where: { id },
        data: {
          total,
          itemsCount,
          items: { create: changes.itemsList.map((i) => ({ productId: i.productId, nombre: i.nombre, precio: i.precio, cantidad: i.cantidad })) },
        },
      });
    }

    return new Order(toOrderData({ ...updated, ...data }));
  }

  async softDelete(id: string): Promise<void> {
    const existing = await this.prisma.order.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundError('Pedido no encontrado');
    await this.prisma.order.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
