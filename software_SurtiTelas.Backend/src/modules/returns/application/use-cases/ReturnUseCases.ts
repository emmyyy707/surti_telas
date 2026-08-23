/* eslint-disable @typescript-eslint/no-explicit-any */
import { NotFoundError } from '../../../../shared/domain/errors';
import type { CreateReturnInput, ReturnRepository, UpdateReturnInput } from '../../domain/repositories/ReturnRepository';
import { Return } from '../../domain/entities/Return';
import { PrismaClient } from '@prisma/client';
import type { EventBus } from '../../../../shared/application/events';
import {
  ReturnCreatedEvent,
  ReturnUpdatedEvent,
  ReturnStatusUpdatedEvent,
  ReturnDeletedEvent,
} from '../../../../shared/application/events';

function generarNumero(seq: number): string {
  return `DEV-${String(seq).padStart(4, '0')}`;
}

export class ListReturns {
  constructor(private readonly repo: ReturnRepository) {}
  execute(filters?: { estado?: Return['estado']; page?: number; limit?: number }) {
    return this.repo.list(filters);
  }
}

export class GetReturn {
  constructor(private readonly repo: ReturnRepository) {}
  async execute(id: string) {
    const ret = await this.repo.getById(id);
    if (!ret) throw new NotFoundError('Devolución no encontrada');
    return ret;
  }
}

export class CreateReturn {
  constructor(private readonly repo: ReturnRepository, private readonly prisma: PrismaClient, private readonly eventBus?: EventBus) {}
  async execute(input: CreateReturnInput & { clienteId?: string; clienteNombre?: string }, requestId?: string) {
    const numero = await this.repo.nextNumero();
    let orderId = input.orderId;
    if (orderId && !orderId.startsWith('c')) {
      const order = await this.prisma.order.findFirst({ where: { numero: orderId, deletedAt: null }, select: { id: true, clienteId: true } });
      if (order) {
        if (input.clienteId && order.clienteId !== input.clienteId) {
          throw new NotFoundError('El pedido no pertenece al cliente autenticado');
        }
        orderId = order.id;
      }
    }
    const ret = new Return({
      numeroDevolucion: numero,
      orderId: orderId ?? null,
      prenda: input.prenda ?? null,
      referencia: input.referencia ?? null,
      motivo: input.motivo ?? null,
      cantidad: input.cantidad,
      cantidadInspeccionada: input.cantidadInspeccionada ?? 0,
      fechaDevolucion: input.fechaDevolucion ? new Date(input.fechaDevolucion) : new Date(),
      estado: 'RECIBIDO',
      destino: input.destino ?? 'REINGRESO_INVENTARIO',
      cliente: input.cliente ?? null,
      clienteId: input.clienteId ?? null,
      responsable: input.responsable ?? null,
      observaciones: input.observaciones ?? null,
      imagenes: input.imagenes ?? [],
    });
    const created = await this.repo.create(ret as any);

    if (this.eventBus) {
      this.eventBus.publish(
        new ReturnCreatedEvent({
          returnId: created.id!,
          numeroDevolucion: created.numeroDevolucion!,
          orderId: created.orderId ?? undefined,
          orderNumero: created.orderId ?? undefined,
          prenda: created.prenda ?? '',
          referencia: created.referencia ?? '',
          motivo: created.motivo ?? '',
          cantidad: created.cantidad,
          clienteId: created.clienteId ?? undefined,
          clienteNombre: created.cliente ?? undefined,
          responsable: created.responsable ?? undefined,
          destino: created.destino!,
        }, requestId)
      );
    }

    return created;
  }
}

export class UpdateReturn {
  constructor(private readonly repo: ReturnRepository, private readonly eventBus?: EventBus) {}
  async execute(id: string, changes: UpdateReturnInput, requestId?: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Devolución no encontrada');
    const updated = await this.repo.update(id, changes);

    if (this.eventBus) {
      this.eventBus.publish(
        new ReturnUpdatedEvent({
          returnId: updated.id!,
          numeroDevolucion: updated.numeroDevolucion!,
          cambios: changes as Record<string, unknown>,
          clienteId: updated.clienteId ?? undefined,
          clienteNombre: updated.cliente ?? undefined,
        }, requestId)
      );
    }

    return updated;
  }
}

export class ChangeReturnStatus {
  constructor(private readonly repo: ReturnRepository, private readonly eventBus?: EventBus) {}
  async execute(id: string, estado: Return['estado'], requestId?: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Devolución no encontrada');
    const previousStatus = existing.estado;
    if (previousStatus === estado) return existing;
    const updated = await this.repo.update(id, { estado });

    if (this.eventBus) {
      this.eventBus.publish(
        new ReturnStatusUpdatedEvent({
          returnId: updated.id!,
          numeroDevolucion: updated.numeroDevolucion!,
          previousStatus,
          newStatus: estado,
          clienteId: updated.clienteId ?? undefined,
          clienteNombre: updated.cliente ?? undefined,
        }, requestId)
      );
    }

    return updated;
  }
}

export class DeleteReturn {
  constructor(private readonly repo: ReturnRepository, private readonly eventBus?: EventBus) {}
  async execute(id: string, requestId?: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Devolución no encontrada');
    await this.repo.delete(id);

    if (this.eventBus) {
      this.eventBus.publish(
        new ReturnDeletedEvent({
          returnId: existing.id!,
          numeroDevolucion: existing.numeroDevolucion!,
          clienteId: existing.clienteId ?? undefined,
          clienteNombre: existing.cliente ?? undefined,
        }, requestId)
      );
    }
  }
}

export { generarNumero };

