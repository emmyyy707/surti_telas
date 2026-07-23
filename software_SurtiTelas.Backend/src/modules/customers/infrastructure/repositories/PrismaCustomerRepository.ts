import { Prisma, PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../../shared/domain/errors';
import { Customer } from '../../domain/entities/Customer';
import type {
  CreateCustomerInput,
  CustomerFilters,
  CustomerRepository,
  UpdateCustomerInput,
} from '../../domain/repositories/CustomerRepository';
import { STATUS_TO_DB, toCustomerData } from '../mappers/CustomerMapper';

const include = {
  asesor: true,
  _count: { select: { orders: true } },
} satisfies Prisma.CustomerInclude;

export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: CustomerFilters = {}): Promise<{ data: Customer[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }> {
    const where: Prisma.CustomerWhereInput = { deletedAt: null };
    if (filters.search) {
      where.OR = [
        { nombre: { contains: filters.search, mode: 'insensitive' } },
        { nit: { contains: filters.search, mode: 'insensitive' } },
        { ciudad: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.asesorId) where.asesorId = filters.asesorId;
    if (filters.estado) where.estado = STATUS_TO_DB[filters.estado];

    const limit = filters.limit ?? 50;
    const sort = filters.sort ?? 'nombre';
    const order = filters.order ?? 'asc';
    const orderBy: Prisma.CustomerOrderByWithRelationInput[] = [{ [sort]: order }, { id: order }];

    const cursorId = filters.cursor ? Buffer.from(filters.cursor, 'base64').toString('utf-8') : undefined;

    if (cursorId) {
      const cursorWhere: Prisma.CustomerWhereInput = {
        ...where,
        OR: [
          { id: order === 'asc' ? { gt: cursorId } : { lt: cursorId } },
        ],
      };

      const [rows, total] = await this.prisma.$transaction([
        this.prisma.customer.findMany({
          where: cursorWhere,
          include,
          orderBy,
          take: limit + 1,
        }),
        this.prisma.customer.count({ where }),
      ]);

      const hasMore = rows.length > limit;
      const data = hasMore ? rows.slice(0, limit) : rows;
      const nextCursor = hasMore && data.length ? Buffer.from(data[data.length - 1].id).toString('base64') : undefined;

      return {
        data: data.map((r) => new Customer(toCustomerData(r))),
        meta: { total, page: 1, limit, nextCursor },
      };
    }

    const page = filters.page ?? 1;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        include,
        orderBy: orderBy as Prisma.CustomerOrderByWithRelationInput,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: rows.map((r) => new Customer(toCustomerData(r))),
      meta: { total, page, limit },
    };
  }

  async getById(id: string): Promise<Customer | null> {
    const row = await this.prisma.customer.findFirst({ where: { id, deletedAt: null }, include });
    return row ? new Customer(toCustomerData(row)) : null;
  }

  async create(input: CreateCustomerInput): Promise<Customer> {
    const data = toCustomerData(
      await this.prisma.customer.create({
        data: {
          nombre: input.nombre,
          ciudad: input.ciudad,
          telefono: input.tel,
          asesorId: input.asesorId,
          nit: input.nit,
          cupoTotal: input.cupoTotal ?? 0,
          cupoUsado: input.cupoUsado ?? 0,
          deudaVencida: input.deudaVencida ?? 0,
          isTrustedCustomer: input.isTrustedCustomer ?? false,
          estado: input.estado ? STATUS_TO_DB[input.estado] : 'ACTIVO',
        },
        include,
      })
    );
    return new Customer(data);
  }

  async update(id: string, changes: UpdateCustomerInput): Promise<Customer> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Cliente no encontrado');

    const row = await this.prisma.customer.update({
      where: { id },
      data: {
        nombre: changes.nombre,
        ciudad: changes.ciudad,
        telefono: changes.tel,
        nit: changes.nit,
        cupoTotal: changes.cupoTotal,
        cupoUsado: changes.cupoUsado,
        deudaVencida: changes.deudaVencida,
        isTrustedCustomer: changes.isTrustedCustomer,
        estado: changes.estado ? STATUS_TO_DB[changes.estado] : undefined,
        asesorId: changes.asesorId,
      },
      include,
    });
    return new Customer(toCustomerData(row));
  }

  async assignAsesor(id: string, asesorId: string): Promise<Customer> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Cliente no encontrado');
    const row = await this.prisma.customer.update({
      where: { id },
      data: { asesorId },
      include,
    });
    return new Customer(toCustomerData(row));
  }

  async updateCupo(id: string, cupoTotal?: number, cupoUsado?: number, deudaVencida?: number): Promise<Customer> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Cliente no encontrado');
    const row = await this.prisma.customer.update({
      where: { id },
      data: {
        ...(cupoTotal !== undefined ? { cupoTotal } : {}),
        ...(cupoUsado !== undefined ? { cupoUsado } : {}),
        ...(deudaVencida !== undefined ? { deudaVencida } : {}),
      },
      include,
    });
    return new Customer(toCustomerData(row));
  }

  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Cliente no encontrado');
    await this.prisma.customer.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
