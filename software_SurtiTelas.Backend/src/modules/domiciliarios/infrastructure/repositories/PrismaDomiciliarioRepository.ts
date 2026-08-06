import { Prisma, PrismaClient } from '@prisma/client';
import { Domiciliario } from '../../domain/entities/Domiciliario';
import type {
  DomiciliarioRepository,
  CreateDomiciliarioInput,
  UpdateDomiciliarioInput,
  DomiciliarioFilters,
} from '../../domain/repositories/DomiciliarioRepository';

const toDomiciliario = (row: Prisma.DomiciliarioGetPayload<object>): Domiciliario => ({
  id: row.id,
  userId: row.userId,
  zona: row.zona ?? undefined,
  vehiculo: row.vehiculo ?? undefined,
  capacidad: row.capacidad ?? undefined,
  activo: row.activo ?? true,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export class PrismaDomiciliarioRepository implements DomiciliarioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: DomiciliarioFilters): Promise<{ data: Domiciliario[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }> {
    const where: Prisma.DomiciliarioWhereInput = {
      ...(filters.zona ? { zona: { equals: filters.zona, mode: 'insensitive' } } : {}),
      ...(filters.activo !== undefined ? { activo: filters.activo } : {}),
    };
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.domiciliario.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.domiciliario.count({ where }),
    ]);
    return { data: rows.map(toDomiciliario), meta: { total, page, limit } };
  }

  async getById(id: string): Promise<Domiciliario | null> {
    const row = await this.prisma.domiciliario.findFirst({ where: { id } });
    return row ? new Domiciliario(toDomiciliario(row)) : null;
  }

  async getByUserId(userId: string): Promise<Domiciliario | null> {
    const row = await this.prisma.domiciliario.findFirst({ where: { userId } });
    return row ? new Domiciliario(toDomiciliario(row)) : null;
  }

  async create(data: CreateDomiciliarioInput): Promise<Domiciliario> {
    const row = await this.prisma.domiciliario.create({
      data: {
        userId: data.userId,
        zona: data.zona,
        vehiculo: data.vehiculo,
        capacidad: data.capacidad,
      },
    });
    return new Domiciliario(toDomiciliario(row));
  }

  async update(id: string, changes: UpdateDomiciliarioInput): Promise<Domiciliario> {
    const row = await this.prisma.domiciliario.update({
      where: { id },
      data: {
        ...(changes.zona !== undefined ? { zona: changes.zona } : {}),
        ...(changes.vehiculo !== undefined ? { vehiculo: changes.vehiculo } : {}),
        ...(changes.capacidad !== undefined ? { capacidad: changes.capacidad } : {}),
        ...(changes.activo !== undefined ? { activo: changes.activo } : {}),
      },
    });
    return new Domiciliario(toDomiciliario(row));
  }
}
