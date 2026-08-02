/* eslint-disable @typeScript-eslint/no-explicit-any */
import { BadRequestError, NotFoundError } from '../../../../shared/domain/errors';
import type { CreateDeliveryInput, DeliveryRepository, UpdateDeliveryInput } from '../../domain/repositories/DeliveryRepository';
import { Delivery } from '../../domain/entities/Delivery';
import { PrismaClient } from '@prisma/client';

export class ListDeliveries {
  constructor(private readonly repo: DeliveryRepository) {}
  execute(filters?: { estado?: Delivery['estado']; domiciliarioId?: string; page?: number; limit?: number }) {
    return this.repo.list(filters);
  }
}

export class ListRutaDelDia {
  constructor(private readonly prisma: PrismaClient) {}
  async execute(filters?: { domiciliarioId?: string; estado?: string }) {
    const [deliveriesRaw, orphanOrders] = await Promise.all([
      this.prisma.delivery.findMany({
        where: {
          deletedAt: null,
          ...(filters?.domiciliarioId ? { domiciliarioId: filters.domiciliarioId } : {}),
          ...(filters?.estado ? { estado: filters.estado } : { estado: { in: ['ASIGNADO', 'EN_RUTA', 'ENTREGADO', 'FALLIDO'] } }),
        },
        include: {
          order: {
            include: {
              cliente: {
                select: {
                  nombre: true,
                  telefono: true,
                  ciudad: true,
                },
              },
            },
          },
          domiciliario: {
            select: {
              nombre: true,
              email: true,
              telefono: true,
            },
          },
        } as any,
        orderBy: { asignadoEn: 'asc' },
      }),
      this.prisma.order.findMany({
        where: {
          deletedAt: null,
          estado: 'DESPACHADO',
          deliveries: { none: {} },
        },
        include: {
          cliente: {
            select: {
              nombre: true,
              telefono: true,
              ciudad: true,
            },
          },
        },
      }),
    ]);

    const deliveries = deliveriesRaw as any[];
    const deliveryMap = new Map<string, (typeof deliveries)[number]>([...deliveries].map((d: any) => [d.orderId, d]));
    const mappedDeliveries = deliveries.map((delivery: any) => {
      const order = delivery.order;
      const cliente = order?.cliente;
      return {
        id: delivery.id,
        orderId: delivery.orderId,
        estado: delivery.estado,
        domiciliarioId: delivery.domiciliarioId,
        domiciliarioNombre: delivery.domiciliario?.nombre ?? null,
        domiciliarioTelefono: delivery.domiciliario?.telefono ?? null,
        direccion: cliente?.direccion || delivery.direccion || null,
        ciudad: cliente?.ciudad || delivery.ciudad || null,
        telefono: cliente?.telefono || delivery.telefono || null,
        notas: delivery.notas,
        asignadoEn: delivery.asignadoEn,
        entregadoEn: delivery.entregadoEn,
        order: {
          numero: order?.numero ?? null,
          cliente: cliente?.nombre || order?.clienteNombre || null,
          telefono: cliente?.telefono ?? null,
          direccion: cliente?.direccion ?? null,
          ciudad: cliente?.ciudad ?? null,
          total: order?.total ? Number(order.total) : null,
        },
      };
    });

    const orphanMapped = (orphanOrders as any[])
      .filter((order: any) => !deliveryMap.has(order.id))
      .map((order: any) => {
        const cliente = order.cliente;
        return {
          id: `orphan-${order.id}`,
          orderId: order.id,
          estado: 'ASIGNADO' as const,
          domiciliarioId: filters?.domiciliarioId ?? null,
          domiciliarioNombre: null,
          domiciliarioTelefono: null,
          direccion: null,
          ciudad: cliente?.ciudad ?? null,
          telefono: cliente?.telefono ?? null,
          notas: null,
          asignadoEn: null,
          entregadoEn: null,
          order: {
            numero: order.numero,
            cliente: cliente?.nombre || order.clienteNombre || null,
            telefono: cliente?.telefono ?? null,
            direccion: null,
            ciudad: cliente?.ciudad ?? null,
            total: order.total ? Number(order.total) : null,
          },
        };
      });

    const orphanFiltered = filters?.domiciliarioId ? [] : orphanMapped;
    return [...mappedDeliveries, ...orphanFiltered];
  }
}

export class GetDelivery {
  constructor(private readonly repo: DeliveryRepository) {}
  async execute(id: string) {
    const delivery = await this.repo.getById(id);
    if (!delivery) throw new NotFoundError('Entrega no encontrada');
    return delivery;
  }
}

export class CreateDelivery {
  constructor(private readonly repo: DeliveryRepository) {}
  async execute(input: CreateDeliveryInput) {
    const delivery = new Delivery({
      orderId: input.orderId,
      domiciliarioId: input.domiciliarioId ?? null,
      estado: 'ASIGNADO',
      direccion: input.direccion ?? null,
      ciudad: input.ciudad ?? null,
      telefono: input.telefono ?? null,
      notas: input.notas ?? null,
      asignadoEn: new Date(),
    });
    return this.repo.create(delivery as any);
  }
}

export class UpdateDelivery {
  constructor(private readonly repo: DeliveryRepository) {}
  async execute(id: string, changes: UpdateDeliveryInput) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Entrega no encontrada');
    return this.repo.update(id, changes);
  }
}

export class ChangeDeliveryStatus {
  constructor(
    private readonly repo: DeliveryRepository,
    private readonly orderRepo?: { updateStatus(id: string, estado: string): Promise<any> },
  ) {}
  async execute(id: string, estado: Delivery['estado'], role?: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Entrega no encontrada');

    if (role && role !== 'DOMICILIARIO' && (estado === 'ENTREGADO' || estado === 'FALLIDO')) {
      throw new BadRequestError('Solo el domiciliario puede marcar ENTREGADO o FALLIDO');
    }

    const updated = new Delivery({ ...existing.toDTO(), estado });
    if (estado === 'ENTREGADO') updated.marcarEntregado();
    if (estado === 'EN_RUTA') updated.marcarEnRuta();
    if (estado === 'FALLIDO') updated.marcarFallido();
    const result = await this.repo.update(id, { estado: updated.estado, entregadoEn: updated.entregadoEn });

    if (estado === 'ENTREGADO' && this.orderRepo) {
      try {
        await this.orderRepo.updateStatus(existing.orderId, 'Entregado');
      } catch (error) {
        const err = error as Error;
        console.error('[ChangeDeliveryStatus] Order update failed', {
          name: err.name,
          message: err.message,
          stack: err.stack,
        });
        throw error;
      }
    }

    return result;
  }
}

export class DeleteDelivery {
  constructor(private readonly repo: DeliveryRepository) {}
  async execute(id: string) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new NotFoundError('Entrega no encontrada');
    return this.repo.delete(id);
  }
}

