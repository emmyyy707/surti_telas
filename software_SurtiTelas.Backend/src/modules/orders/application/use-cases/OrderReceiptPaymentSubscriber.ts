import type { DomainEvent, EventBus } from '../../../../shared/application/events';
import { prisma } from '../../../../config/database';

export class OrderReceiptPaymentSubscriber {
  constructor(private readonly eventBus: EventBus) {
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
        paymentMethod: string;
        installments?: number;
        tipoFlujo?: string;
      };

      if (payload.tipoFlujo === 'VENTAS') {
        return;
      }

      const methodMap: Record<string, 'CASH' | 'TRANSFER' | 'CARD' | 'OTHER'> = {
        CASH: 'CASH',
        TRANSFER: 'TRANSFER',
        CARD: 'CARD',
        OTHER: 'OTHER',
      };

      const paymentMethod = methodMap[payload.paymentMethod] || 'OTHER';

      await prisma.$transaction(async (tx) => {
        await tx.receipt.create({
          data: {
            orderId: payload.orderId,
            customerId: payload.clienteId,
            numero: payload.orderNumero,
            total: payload.total,
            concepto: `Pedido ${payload.orderNumero} - ${payload.itemsCount} ítems`,
            emitidoPor: payload.asesorNombre,
            estado: 'BORRADOR',
          },
        });

        await tx.payment.create({
          data: {
            orderId: payload.orderId,
            customerId: payload.clienteId,
            asesorId: payload.asesorId,
            amount: payload.total,
            method: paymentMethod,
            status: 'PENDING',
            notes: payload.installments ? `Pago por abonos: ${payload.installments} cuotas` : 'Pago inmediato',
          },
        });
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

      if (payload.newStatus !== 'Aceptado') {
        return;
      }

      await prisma.receipt.create({
        data: {
          orderId: payload.orderId,
          customerId: payload.clienteId,
          numero: payload.orderNumero,
          total: 0,
          concepto: `Pedido ${payload.orderNumero}`,
          emitidoPor: payload.asesorNombre,
          estado: 'EMITIDO',
          estadoEnvio: 'PENDIENTE',
        },
      });

      await prisma.payment.create({
        data: {
          orderId: payload.orderId,
          customerId: payload.clienteId,
          asesorId: payload.asesorId,
          amount: 0,
          method: 'OTHER',
          status: 'PENDING',
          notes: 'Pago a cuotas',
        },
      });
    });
  }
}
