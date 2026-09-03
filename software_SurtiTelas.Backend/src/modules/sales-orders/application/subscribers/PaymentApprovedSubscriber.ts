import type { DomainEvent, EventBus } from '../../../../shared/application/events';
import { prisma } from '../../../../config/database';
import { logger } from '../../../../shared/infrastructure/logger';

/**
 * Regla de negocio: 1 VENTA = 1 PAGO CONFIRMADO.
 *
 * Este subscriber es el ÚNICO punto donde se crean ventas en el sistema.
 * Escucha 'payment.status.updated' y reacciona así:
 *
 * - newStatus = 'APPROVED':
 *     Crea exactamente 1 venta asociada al paymentId (idempotente).
 *     Si la venta ya existe, no hace nada.
 *     Si la venta es legacy (paymentId = null) y NO hay venta para este
 *     paymentId, crea una nueva venta. La venta legacy se mantiene intacta
 *     para preservar histórico financiero.
 *
 * - newStatus = 'ANULADO' o 'REFUNDED':
 *     Marca la venta existente como ANULADA (estado + paymentStatus) para
 *     que no siga contando en analytics / financial / commission.
 *
 * - newStatus = 'REJECTED' o 'PENDING':
 *     No realiza ninguna acción (no se crea venta).
 */
export class PaymentApprovedSubscriber {
  constructor(private readonly eventBus: EventBus) {
    this.subscribe();
  }

  private subscribe() {
    this.eventBus.subscribe('payment.status.updated', async (event: DomainEvent) => {
      const payload = event.payload as {
        paymentId: string;
        orderId?: string;
        customerId: string;
        previousStatus: string;
        newStatus: string;
        amount: number;
        asesorId?: string;
      };

      if (payload.newStatus === 'APPROVED') {
        await this.handleApproved(payload);
      } else if (payload.newStatus === 'ANULADO' || payload.newStatus === 'REFUNDED') {
        await this.handleCancelledOrRefunded(payload);
      } else {
        // PENDING, REJECTED: no crean venta.
        logger.debug('[PaymentApprovedSubscriber] Estado de pago no genera venta', {
          paymentId: payload.paymentId,
          newStatus: payload.newStatus,
        });
      }
    });
  }

  private async handleApproved(payload: {
    paymentId: string;
    orderId?: string;
    customerId: string;
    amount: number;
    asesorId?: string;
  }) {
    try {
      // 1) Idempotencia por paymentId.
      const existingByPayment = await prisma.sale.findFirst({
        where: { paymentId: payload.paymentId, deletedAt: null },
      });
      if (existingByPayment) {
        logger.info('[PaymentApprovedSubscriber] Venta ya existe para paymentId (idempotente)', {
          paymentId: payload.paymentId,
          saleId: existingByPayment.id,
        });
        return;
      }

      // 2) Necesitamos orderId. Sin orderId no podemos crear la venta.
      if (!payload.orderId) {
        logger.warn('[PaymentApprovedSubscriber] Pago sin orderId, no se crea venta', {
          paymentId: payload.paymentId,
        });
        return;
      }

      // 3) Cargar el pago y el pedido para obtener datos completos.
      const payment = await prisma.payment.findFirst({
        where: { id: payload.paymentId, deletedAt: null },
      });
      if (!payment) {
        logger.warn('[PaymentApprovedSubscriber] Pago no encontrado', { paymentId: payload.paymentId });
        return;
      }

      const order = await prisma.order.findFirst({
        where: { id: payload.orderId, deletedAt: null },
        include: { cliente: true, asesor: true },
      });
      if (!order) {
        logger.warn('[PaymentApprovedSubscriber] Pedido no encontrado para pago', {
          paymentId: payload.paymentId,
          orderId: payload.orderId,
        });
        return;
      }

      // 4) Determinar tipoPago, numeroCuota, totalCuotas, esAnticipo, esSaldo
      //    a partir de las notas del pago (formato JSON o "ABONO_INICIAL|...").
      const meta = this.parsePaymentNotes(payment.notes ?? null);

      const toNumber = (v: unknown): number => {
        if (v == null) return 0;
        if (typeof v === 'number') return v;
        if (typeof v === 'string') return Number(v);
        if (typeof v === 'object' && v && 'toNumber' in (v as Record<string, unknown>)) {
          return Number((v as { toNumber: () => number }).toNumber());
        }
        return Number(v);
      };
      const paymentAmount = toNumber(payment.amount);

      await prisma.sale.create({
        data: {
          orderId: order.id,
          clienteId: order.clienteId,
          clienteNombre: order.clienteNombre,
          asesorId: order.asesorId ?? '',
          asesorNombre: order.asesorNombre ?? '',
          fechaVenta: payment.paidAt ?? new Date(),
          subtotal: toNumber(order.subtotal) || paymentAmount,
          impuestos: toNumber(order.impuestos),
          descuentos: toNumber(order.descuentos),
          total: paymentAmount,
          estado: 'COMPLETADA',
          medioPago: payment.method,
          paymentId: payload.paymentId,
          tipoPago: meta.tipoPago,
          numeroCuota: meta.numeroCuota,
          totalCuotas: meta.totalCuotas,
          esAnticipo: meta.esAnticipo,
          esSaldo: meta.esSaldo,
          paymentStatus: 'APPROVED',
          // Si el comprobante está en el pago, usarlo; si no, fallback al pedido.
          comprobantePagoUrl: payment.comprobantePagoUrl ?? order.comprobantePagoUrl ?? null,
          registradoPorId: payload.asesorId ?? null,
        },
      });

      logger.info('[PaymentApprovedSubscriber] Venta creada por pago confirmado', {
        paymentId: payload.paymentId,
        orderId: order.id,
        amount: Number(payment.amount),
        tipoPago: meta.tipoPago,
      });
    } catch (error) {
      logger.error('[PaymentApprovedSubscriber] Error creando venta por pago aprobado', {
        paymentId: payload.paymentId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private async handleCancelledOrRefunded(payload: {
    paymentId: string;
    newStatus: string;
  }) {
    try {
      const existing = await prisma.sale.findFirst({
        where: { paymentId: payload.paymentId, deletedAt: null },
      });
      if (!existing) return;

      const newEstado = payload.newStatus === 'REFUNDED' ? 'ANULADA' : 'ANULADA';
      await prisma.sale.update({
        where: { id: existing.id },
        data: {
          estado: newEstado,
          paymentStatus: payload.newStatus,
        },
      });

      logger.info('[PaymentApprovedSubscriber] Venta marcada por cancelación/reembolso', {
        paymentId: payload.paymentId,
        saleId: existing.id,
        newPaymentStatus: payload.newStatus,
      });
    } catch (error) {
      logger.error('[PaymentApprovedSubscriber] Error actualizando venta anulada/reembolsada', {
        paymentId: payload.paymentId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Las notas del pago codifican metadatos del pago en formato JSON:
   *   { tipoPago, numeroCuota, totalCuotas, esAnticipo, esSaldo }
   * Si no hay JSON válido, devuelve defaults seguros.
   */
  private parsePaymentNotes(notes: string | null): {
    tipoPago: string | null;
    numeroCuota: number | null;
    totalCuotas: number | null;
    esAnticipo: boolean | null;
    esSaldo: boolean | null;
  } {
    if (!notes) {
      return { tipoPago: null, numeroCuota: null, totalCuotas: null, esAnticipo: null, esSaldo: null };
    }
    try {
      const parsed = JSON.parse(notes) as Record<string, unknown>;
      return {
        tipoPago: typeof parsed.tipoPago === 'string' ? parsed.tipoPago : null,
        numeroCuota: typeof parsed.numeroCuota === 'number' ? parsed.numeroCuota : null,
        totalCuotas: typeof parsed.totalCuotas === 'number' ? parsed.totalCuotas : null,
        esAnticipo: typeof parsed.esAnticipo === 'boolean' ? parsed.esAnticipo : null,
        esSaldo: typeof parsed.esSaldo === 'boolean' ? parsed.esSaldo : null,
      };
    } catch {
      // Formato legacy: "Pago por abonos: N cuotas" / "Pago inmediato"
      if (/abonos?\s*:?\s*\d+\s*cuotas?/i.test(notes)) {
        const m = notes.match(/(\d+)/);
        const totalCuotas = m ? Number(m[1]) : null;
        return {
          tipoPago: totalCuotas && totalCuotas > 1 ? 'CUOTA' : 'PAGO_INMEDIATO',
          numeroCuota: null,
          totalCuotas,
          esAnticipo: false,
          esSaldo: false,
        };
      }
      return { tipoPago: 'PAGO_INMEDIATO', numeroCuota: null, totalCuotas: null, esAnticipo: false, esSaldo: false };
    }
  }
}
