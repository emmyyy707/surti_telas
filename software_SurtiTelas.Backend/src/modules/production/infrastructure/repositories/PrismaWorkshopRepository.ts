import { Prisma, PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../../shared/domain/errors';
import { Workshop } from '../../domain/entities/Workshop';
import type {
  CreateWorkshopInput,
  WorkshopFilters,
  WorkshopRepository,
  UpdateWorkshopInput,
} from '../../domain/repositories/WorkshopRepository';
import { toWorkshopData, WORKSHOP_STATUS_TO_DB } from '../mappers/WorkshopMapper';

export class PrismaWorkshopRepository implements WorkshopRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: WorkshopFilters = {}): Promise<{ data: Workshop[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }> {
    const where: Prisma.WorkshopWhereInput = { deletedAt: null };
    if (filters.search) {
      where.OR = [
        { nombre: { contains: filters.search, mode: 'insensitive' } },
        { ciudad: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.estado) where.estado = WORKSHOP_STATUS_TO_DB[filters.estado];

    const limit = filters.limit ?? 50;
    const sort = filters.sort ?? 'nombre';
    const order = filters.order ?? 'asc';
    const orderBy: Prisma.WorkshopOrderByWithRelationInput[] = [{ [sort]: order }, { id: order }];

    const cursorId = filters.cursor ? Buffer.from(filters.cursor, 'base64').toString('utf-8') : undefined;

    if (cursorId) {
      const cursorWhere: Prisma.WorkshopWhereInput = {
        ...where,
        OR: [
          { id: order === 'asc' ? { gt: cursorId } : { lt: cursorId } },
        ],
      };

      const [rows, total, ocupaciones] = await this.prisma.$transaction([
        this.prisma.workshop.findMany({
          where: cursorWhere,
          orderBy,
          take: limit + 1,
          select: {
            id: true,
            nombre: true,
            encargadoId: true,
            direccion: true,
            ciudad: true,
            telefono: true,
            email: true,
            estado: true,
            capacidad: true,
            ocupacion: true,
          },
        }),
        this.prisma.workshop.count({ where }),
        this.prisma.productionOrder.groupBy({
          by: ['tallerId'],
          where: { deletedAt: null, estado: { in: ['ASIGNADA', 'EN_PROCESO'] } },
          _sum: { cantidad: true },
          orderBy: { tallerId: 'asc' },
        }),
      ]);

      const ocupacionPorTaller = new Map<string, number>();
      for (const row of ocupaciones) {
        if (row.tallerId) ocupacionPorTaller.set(row.tallerId, row._sum?.cantidad ?? 0);
      }

      const hasMore = rows.length > limit;
      const data = hasMore ? rows.slice(0, limit) : rows;
      const nextCursor = hasMore && data.length ? Buffer.from(data[data.length - 1].id).toString('base64') : undefined;

      return {
        data: data.map((r) => new Workshop({ ...toWorkshopData(r), ocupacion: ocupacionPorTaller.get(r.id) ?? 0 })),
        meta: { total, page: 1, limit, nextCursor },
      };
    }

    const page = filters.page ?? 1;
    const [rows, total, ocupaciones] = await this.prisma.$transaction([
      this.prisma.workshop.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          nombre: true,
          encargadoId: true,
          direccion: true,
          ciudad: true,
          telefono: true,
          email: true,
          estado: true,
          capacidad: true,
          ocupacion: true,
        },
      }),
      this.prisma.workshop.count({ where }),
      this.prisma.productionOrder.groupBy({
        by: ['tallerId'],
        where: { deletedAt: null, estado: { in: ['ASIGNADA', 'EN_PROCESO'] } },
        _sum: { cantidad: true },
        orderBy: { tallerId: 'asc' },
      }),
    ]);

    const ocupacionPorTaller = new Map<string, number>();
    for (const row of ocupaciones) {
      if (row.tallerId) ocupacionPorTaller.set(row.tallerId, row._sum?.cantidad ?? 0);
    }

    const mapped = rows.map((r) => new Workshop({ ...toWorkshopData(r), ocupacion: ocupacionPorTaller.get(r.id) ?? 0 }));
    console.log('[Workshops] repo list sample', JSON.stringify(mapped.slice(0, 2)));

    return {
      data: mapped,
      meta: { total, page, limit },
    };
  }

  async getById(id: string): Promise<Workshop | null> {
    const row = await this.prisma.workshop.findFirst({ 
      where: { id, deletedAt: null },
      select: {
        id: true,
        nombre: true,
        encargadoId: true,
        direccion: true,
        ciudad: true,
        telefono: true,
        email: true,
        estado: true,
        capacidad: true,
        ocupacion: true,
      },
    });
    if (!row) return null;

    const ocupacionRow = await this.prisma.productionOrder.aggregate({
      where: { tallerId: id, deletedAt: null, estado: { in: ['ASIGNADA', 'EN_PROCESO'] } },
      _sum: { cantidad: true },
    });

    return new Workshop({
      ...toWorkshopData(row),
      ocupacion: ocupacionRow._sum?.cantidad ?? 0,
    });
  }

  async create(input: CreateWorkshopInput): Promise<Workshop> {
    const row = await this.prisma.workshop.create({
      data: {
        nombre: input.nombre,
        encargadoId: input.encargadoId,
        direccion: input.direccion,
        ciudad: input.ciudad,
        telefono: input.telefono,
        email: input.email,
        estado: input.estado ? WORKSHOP_STATUS_TO_DB[input.estado] : 'ACTIVO',
        capacidad: input.capacidad,
      },
    });
    return new Workshop({ ...toWorkshopData(row), ocupacion: 0 });
  }

  async update(id: string, changes: UpdateWorkshopInput): Promise<Workshop> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Taller no encontrado');

    console.log('[Workshops] repo update changes', JSON.stringify(changes));
    const row = await this.prisma.workshop.update({
      where: { id },
      data: {
        nombre: changes.nombre,
        encargadoId: changes.encargadoId,
        direccion: changes.direccion,
        ciudad: changes.ciudad,
        telefono: changes.telefono,
        email: changes.email,
        estado: changes.estado ? WORKSHOP_STATUS_TO_DB[changes.estado] : undefined,
        capacidad: changes.capacidad,
      },
      select: {
        id: true,
        nombre: true,
        encargadoId: true,
        direccion: true,
        ciudad: true,
        telefono: true,
        email: true,
        estado: true,
        capacidad: true,
        ocupacion: true,
      },
    });
    console.log('[Workshops] repo update row', JSON.stringify(row));
    return new Workshop({ ...toWorkshopData(row), ocupacion: existing.ocupacion ?? 0 });
  }

  async delete(id: string): Promise<void> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Taller no encontrado');
    await this.prisma.workshop.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
