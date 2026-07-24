import { PrismaClient, NotificationType } from '@prisma/client';
import type { DomainEvent, EventBus } from '../../../shared/application/events';

export class NotificationService {
  constructor(private readonly prisma: PrismaClient, private readonly eventBus: EventBus) {
    this.subscribe();
  }

  private subscribe() {
    this.eventBus.subscribe('order.created', async (event: DomainEvent) => {
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

      await this.prisma.notification.create({
        data: {
          tipo: NotificationType.SUCCESS,
          titulo: 'Nuevo pedido creado',
          mensaje: `Pedido ${payload.orderNumero} de ${payload.clienteNombre} por $${payload.total.toLocaleString()} (${payload.itemsCount} ítems)`,
          usuarioId: payload.asesorId,
        },
      });
    });

    this.eventBus.subscribe('order.status.updated', async (event: DomainEvent) => {
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

      const tipoMap: Record<string, NotificationType> = {
        'Cancelado': NotificationType.DANGER,
        'Entregado': NotificationType.SUCCESS,
        'En camino': NotificationType.INFO,
        'Despachado': NotificationType.INFO,
        'Listo': NotificationType.SUCCESS,
        'En producción': NotificationType.WARNING,
      };

      await this.prisma.notification.create({
        data: {
          tipo: tipoMap[payload.newStatus] || NotificationType.INFO,
          titulo: `Pedido ${payload.orderNumero} actualizado`,
          mensaje: `Estado cambiado de "${payload.previousStatus}" a "${payload.newStatus}" para el cliente ${payload.clienteNombre}`,
          usuarioId: payload.asesorId,
        },
      });
    });
  }
}
