import type { DomainEvent, EventBus } from '../../../../shared/application/events';
import { prisma } from '../../../../config/database';
import { logger } from '../../../../shared/infrastructure/logger';

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

      try {
        const existingReceipt = await prisma.receipt.findFirst({
          where: { orderId: payload.orderId, deletedAt: null },
        });

        if (existingReceipt) {
          logger.info(`[OrderReceiptPaymentSubscriber] Recibo ya existe para pedido ${payload.orderId}, no se crea duplicado.`);
          return;
        }

        const order = await prisma.order.findFirst({
          where: { id: payload.orderId, deletedAt: null },
          select: { total: true, items: true },
        });

        const receipt = await prisma.receipt.create({
          data: {
            orderId: payload.orderId,
            customerId: payload.clienteId,
            numero: payload.orderNumero,
            total: Number(order?.total ?? 0),
            concepto: `Pedido ${payload.orderNumero}${order?.items ? ` - ${order.items} ítems` : ''}`,
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
            amount: Number(order?.total ?? 0),
            method: 'OTHER',
            status: 'PENDING',
            notes: 'Pago a cuotas',
          },
        });

        logger.info(`[OrderReceiptPaymentSubscriber] Recibo generado para pedido ${payload.orderId}: ${receipt.id}`);
      } catch (error) {
        logger.error(`[OrderReceiptPaymentSubscriber] Error generando recibo para pedido ${payload.orderId}`, { error: (error as Error).message });
      }
    });

    this.eventBus.subscribe('order.delivered', async (event: DomainEvent) => {
      const payload = event.payload as {
        orderId: string;
        orderNumero: string;
        clienteId: string;
        clienteNombre: string;
        asesorId?: string;
        asesorNombre?: string;
        total: number;
      };

      logger.info(`[OrderReceiptPaymentSubscriber] Evento order.delivered recibido para pedido ${payload.orderId}`, { payload });

      try {
        const existingPayment = await prisma.payment.findFirst({
          where: { orderId: payload.orderId, deletedAt: null },
        });

        if (existingPayment) {
          if (existingPayment.status !== 'APPROVED') {
            await prisma.payment.update({
              where: { id: existingPayment.id },
              data: {
                status: 'APPROVED',
                amount: Number(payload.total),
                paidAt: new Date(),
              },
            });

            logger.info(`[OrderReceiptPaymentSubscriber] Pago actualizado a APPROVED para pedido ${payload.orderId}: ${existingPayment.id}`);
          } else {
            logger.info(`[OrderReceiptPaymentSubscriber] Pago ya aprobado para pedido ${payload.orderId}, no se actualiza.`);
          }
        } else {
          await prisma.payment.create({
            data: {
              orderId: payload.orderId,
              customerId: payload.clienteId,
              asesorId: payload.asesorId || undefined,
              amount: Number(payload.total),
              method: 'OTHER',
              status: 'APPROVED',
              paidAt: new Date(),
              notes: 'Pago completado por entrega del pedido',
            },
          });

          logger.info(`[OrderReceiptPaymentSubscriber] Pago generado por entrega para pedido ${payload.orderId}`);
        }

        const existingSale = await prisma.sale.findFirst({
          where: { orderId: payload.orderId, deletedAt: null },
        });

        if (!existingSale) {
          const order = await prisma.order.findFirst({
            where: { id: payload.orderId, deletedAt: null },
            select: { subtotal: true, impuestos: true, descuentos: true, total: true, medioPago: true },
          });

          await prisma.sale.create({
            data: {
              orderId: payload.orderId,
              clienteId: payload.clienteId,
              clienteNombre: payload.clienteNombre,
              asesorId: payload.asesorId || '',
              asesorNombre: payload.asesorNombre || '',
              fechaVenta: new Date(),
              subtotal: Number(order?.subtotal ?? payload.total),
              impuestos: Number(order?.impuestos ?? 0),
              descuentos: Number(order?.descuentos ?? 0),
              total: Number(order?.total ?? payload.total),
              estado: 'COMPLETADA',
              medioPago: order?.medioPago ?? undefined,
            },
          });

          logger.info(`[OrderReceiptPaymentSubscriber] Venta generada automáticamente por entrega para pedido ${payload.orderId}`);
        }
      } catch (error) {
        logger.error(`[OrderReceiptPaymentSubscriber] Error generando pago/venta por entrega para pedido ${payload.orderId}`, { error: (error as Error).message });
      }
    });
  }
}
