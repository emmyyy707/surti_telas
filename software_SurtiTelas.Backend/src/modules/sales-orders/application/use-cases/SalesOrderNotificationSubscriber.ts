import type { DomainEvent, EventBus } from '../../../../shared/application/events';
import { prisma } from '../../../../config/database';

export class SalesOrderNotificationSubscriber {
  constructor(private readonly eventBus: EventBus) {
    this.subscribe();
  }

  private subscribe() {
    this.eventBus.subscribe('order.payment_proof.uploaded', async (event: DomainEvent) => {
      const payload = event.payload as {
        orderId: string;
        orderNumero: string;
        clienteId: string;
        clienteNombre: string;
        asesorId: string;
        asesorNombre: string;
      };

      await prisma.notification.create({
        data: {
          tipo: 'INFO',
          titulo: 'Comprobante de pago cargado',
          mensaje: `El cliente ${payload.clienteNombre} ha cargado un comprobante de pago para el pedido ${payload.orderNumero}`,
          usuarioId: payload.asesorId,
        },
      });
    });

    this.eventBus.subscribe('order.accepted', async (event: DomainEvent) => {
      const payload = event.payload as {
        orderId: string;
        orderNumero: string;
        clienteId: string;
        clienteNombre: string;
        asesorId: string;
        asesorNombre: string;
        saleId: string;
        receiptId: string;
        total: number;
      };

      await prisma.notification.create({
        data: {
          tipo: 'SUCCESS',
          titulo: 'Pedido aceptado',
          mensaje: `Tu pedido ${payload.orderNumero} ha sido aceptado. Se ha generado el recibo correspondiente.`,
          usuarioId: payload.clienteId,
        },
      });
    });

    this.eventBus.subscribe('order.rejected', async (event: DomainEvent) => {
      const payload = event.payload as {
        orderId: string;
        orderNumero: string;
        clienteId: string;
        clienteNombre: string;
        asesorId: string;
        asesorNombre: string;
        razon: string;
      };

      await prisma.notification.create({
        data: {
          tipo: 'WARNING',
          titulo: 'Pedido rechazado',
          mensaje: `Tu pedido ${payload.orderNumero} ha sido rechazado. Razón: ${payload.razon}`,
          usuarioId: payload.clienteId,
        },
      });
    });
  }
}
