import { Prisma, PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../../shared/domain/errors';
import { ContactMessage } from '../../domain/entities/ContactMessage';
import type { ContactFilters, ContactMessageRepository, CreateContactInput } from '../../domain/repositories/ContactMessageRepository';

const toContactMessage = (row: Prisma.ContactMessageGetPayload<object>) => ({
  id: row.id,
  nombre: row.nombre,
  email: row.email,
  telefono: row.telefono ?? undefined,
  asunto: row.asunto,
  mensaje: row.mensaje,
  leida: row.leida,
  respondida: row.respondida,
  respuesta: row.respuesta ?? undefined,
  respondidoPor: row.respondidoPor ?? undefined,
  respondidoEn: row.respondidoEn ?? undefined,
  estado: row.estado,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  deletedAt: row.deletedAt ?? undefined,
});

export class PrismaContactMessageRepository implements ContactMessageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async list(filters: ContactFilters): Promise<ContactMessage[]> {
    const where: Prisma.ContactMessageWhereInput = { deletedAt: null };
    if (filters.leida !== undefined) where.leida = filters.leida;

    const rows = await this.prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => new ContactMessage(toContactMessage(row)));
  }

  async getById(id: string): Promise<ContactMessage | null> {
    const row = await this.prisma.contactMessage.findFirst({
      where: { id, deletedAt: null },
    });
    return row ? new ContactMessage(toContactMessage(row)) : null;
  }

  async create(input: CreateContactInput): Promise<ContactMessage> {
    const row = await this.prisma.contactMessage.create({
      data: {
        nombre: input.nombre,
        email: input.email,
        telefono: input.telefono,
        asunto: input.asunto,
        mensaje: input.mensaje,
        leida: false,
        respondida: false,
      },
    });
    return new ContactMessage(toContactMessage(row));
  }

  async markAsRead(id: string): Promise<ContactMessage> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Mensaje de contacto no encontrado');

    const row = await this.prisma.contactMessage.update({
      where: { id },
      data: { leida: true },
    });
    return new ContactMessage(toContactMessage(row));
  }

  async update(id: string, changes: Partial<ContactMessage>): Promise<ContactMessage> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Mensaje de contacto no encontrado');

    const row = await this.prisma.contactMessage.update({
      where: { id },
      data: {
        ...(changes.estado && { estado: changes.estado }),
        ...(changes.respuesta && { respuesta: changes.respuesta }),
        ...(changes.respondidoPor && { respondidoPor: changes.respondidoPor }),
        ...(changes.respondidoEn && { respondidoEn: changes.respondidoEn }),
      },
    });
    return new ContactMessage(toContactMessage(row));
  }

  async reply(id: string, respuesta: string, respondidoPor: string): Promise<ContactMessage> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Mensaje de contacto no encontrado');

    const ahora = new Date();
    const row = await this.prisma.contactMessage.update({
      where: { id },
      data: {
        leida: true,
        respondida: true,
        respuesta,
        respondidoPor,
        respondidoEn: ahora,
        estado: 'RESPONDIDO',
      },
    });
    return new ContactMessage(toContactMessage(row));
  }

  async close(id: string): Promise<ContactMessage> {
    const existing = await this.getById(id);
    if (!existing) throw new NotFoundError('Mensaje de contacto no encontrado');

    const row = await this.prisma.contactMessage.update({
      where: { id },
      data: { estado: 'CERRADO' },
    });
    return new ContactMessage(toContactMessage(row));
  }
}
