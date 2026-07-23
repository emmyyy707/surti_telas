import { NotFoundError } from '../../../../shared/domain/errors';
import type { NotificationFilters, NotificationRepository } from '../../domain/repositories/NotificationRepository';
import type { EventBus } from '../../../../shared/application/events';

export class GetNotifications {
  constructor(private readonly repo: NotificationRepository) {}
  execute(filters?: NotificationFilters) {
    return this.repo.list(filters);
  }
}

export class GetNotificationById {
  constructor(private readonly repo: NotificationRepository) {}
  async execute(id: string) {
    const notification = await this.repo.getById(id);
    if (!notification) throw new NotFoundError('Notificación no encontrada');
    return notification;
  }
}

export class MarkNotificationAsRead {
  constructor(private readonly repo: NotificationRepository) {}
  execute(id: string) {
    return this.repo.markAsRead(id);
  }
}

export class CreateNotification {
  constructor(private readonly repo: NotificationRepository) {}
  execute(input: { tipo: 'INFO' | 'WARNING' | 'SUCCESS' | 'DANGER'; titulo: string; mensaje: string; usuarioId?: string }) {
    return this.repo.create(input);
  }
}

export class UpdateNotification {
  constructor(private readonly repo: NotificationRepository) {}
  execute(id: string, changes: { titulo?: string; mensaje?: string; leida?: boolean }) {
    return this.repo.update(id, changes);
  }
}

export class DeleteNotification {
  constructor(private readonly repo: NotificationRepository) {}
  execute(id: string) {
    return this.repo.delete(id);
  }
}

export class NotificationSubscriber {
  constructor(private readonly repo: NotificationRepository) {}

  register(eventBus: EventBus) {
    eventBus.subscribe('order.created', async (event) => {
      const payload = event.payload as {
        orderId: string;
        orderNumero: string;
        clienteId: string;
        clienteNombre: string;
        asesorId: string;
        asesorNombre: string;
        total: number;
        itemsCount: number;
      };

      await this.repo.create({
        tipo: 'SUCCESS',
        titulo: 'Nuevo pedido creado',
        mensaje: `Pedido ${payload.orderNumero} de ${payload.clienteNombre} por $${payload.total} (${payload.itemsCount} ítems)`,
        usuarioId: payload.asesorId,
      });
    });

    eventBus.subscribe('order.status.updated', async (event) => {
      const payload = event.payload as {
        orderId: string;
        orderNumero: string;
        previousStatus: string;
        newStatus: string;
        clienteId: string;
        clienteNombre: string;
        asesorId: string;
        asesorNombre: string;
      };

      const tipoMap: Record<string, 'INFO' | 'WARNING' | 'SUCCESS' | 'DANGER'> = {
        'Cancelado': 'DANGER',
        'Entregado': 'SUCCESS',
        'En camino': 'INFO',
        'Despachado': 'INFO',
        'Listo': 'SUCCESS',
        'En producción': 'WARNING',
      };

      await this.repo.create({
        tipo: tipoMap[payload.newStatus] || 'INFO',
        titulo: `Pedido ${payload.orderNumero} actualizado`,
        mensaje: `Estado cambiado de "${payload.previousStatus}" a "${payload.newStatus}" para el cliente ${payload.clienteNombre}`,
        usuarioId: payload.asesorId,
      });
    });

    eventBus.subscribe('stock.below_minimum', async (event) => {
      const payload = event.payload as {
        rawMaterialId: string;
        rawMaterialNombre: string;
        stockActual: number;
        stockMinimo: number;
      };

      await this.repo.create({
        tipo: 'WARNING',
        titulo: 'Stock bajo en insumo',
        mensaje: `El insumo "${payload.rawMaterialNombre}" tiene stock actual ${payload.stockActual} y mínimo ${payload.stockMinimo}`,
      });
    });

    eventBus.subscribe('production.completed', async (event) => {
      const payload = event.payload as {
        productionOrderId: string;
        referencia: string;
        cantidad: number;
        tallerId?: string;
      };

      await this.repo.create({
        tipo: 'SUCCESS',
        titulo: 'Producción completada',
        mensaje: `Orden de producción ${payload.referencia} (${payload.cantidad} unidades) ha sido completada`,
      });
    });

    eventBus.subscribe('order.delivered', async (event) => {
      const payload = event.payload as {
        orderId: string;
        clienteId: string;
        clienteNombre: string;
        total: number;
      };

      await this.repo.create({
        tipo: 'SUCCESS',
        titulo: 'Pedido entregado',
        mensaje: `Pedido entregado al cliente ${payload.clienteNombre} por $${payload.total}`,
        usuarioId: payload.clienteId,
      });
    });

    eventBus.subscribe('order.canceled', async (event) => {
      const payload = event.payload as {
        orderId: string;
        clienteId: string;
        clienteNombre: string;
        total: number;
        items: { productId: string; productRef: string; cantidad: number }[];
      };

      await this.repo.create({
        tipo: 'DANGER',
        titulo: 'Pedido cancelado',
        mensaje: `Pedido cancelado del cliente ${payload.clienteNombre} por $${payload.total}`,
        usuarioId: payload.clienteId,
      });
    });
  }
}
