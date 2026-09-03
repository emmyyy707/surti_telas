import { prisma } from '../../../../config/database';
import type { OrderRepository } from '../../../orders/domain/repositories/OrderRepository';
import type { OrderHistoryRepository } from '../../domain/repositories/OrderHistoryRepository';
import type { SaleRepository } from '../../domain/repositories/SaleRepository';
import type { ReceiptRepository } from '../../../receipts/domain/repositories/ReceiptRepository';
import type { EventBus } from '../../../../shared/application/events';
import { BadRequestError, NotFoundError } from '../../../../shared/domain/errors';

export interface CreateSaleInput {
  orderId: string;
  paymentId: string;
  medioPago?: string;
  observaciones?: string;
}

/**
 * Regla de negocio: 1 VENTA = 1 PAGO CONFIRMADO.
 *
 * CreateSale está disponible para uso admin/manual. Requiere un paymentId
 * que ya debe estar en estado APPROVED. Si no lo está, rechaza. La venta
 * resultante se asocia 1:1 al paymentId (idempotente).
 *
 * Para el flujo normal del cliente, NO debe usarse este endpoint: el
 * PaymentApprovedSubscriber crea la venta automáticamente al confirmar
 * un pago (PATCH /payments/:id/status con status=APPROVED).
 */
export class CreateSale {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly saleRepo: SaleRepository,
    private readonly receiptRepo: ReceiptRepository,
    private readonly _historyRepo: OrderHistoryRepository,
    private readonly eventBus?: EventBus,
  ) {}

  async execute(input: CreateSaleInput): Promise<{ orderId: string; saleId: string; receiptId: string }> {
    if (!input.orderId) throw new BadRequestError('orderId es obligatorio');
    if (!input.paymentId) throw new BadRequestError('paymentId es obligatorio');

    const order = await this.orderRepo.getById(input.orderId);
    if (!order) throw new NotFoundError('Pedido no encontrado');

    const payment = await prisma.payment.findFirst({
      where: { id: input.paymentId, deletedAt: null },
    });
    if (!payment) throw new NotFoundError('Pago no encontrado');
    if (payment.orderId !== order.id) {
      throw new BadRequestError('El pago no pertenece al pedido indicado');
    }
    if (payment.status !== 'APPROVED') {
      throw new BadRequestError('Solo se pueden crear ventas a partir de pagos APPROVED. Apruebe el pago primero.');
    }

    // Idempotencia: si ya existe una venta para este paymentId, retornarla.
    const existingByPayment = await this.saleRepo.findByPaymentId(input.paymentId);
    if (existingByPayment) {
      const existingReceipt = await this.receiptRepo.findByOrderId(order.id);
      return {
        orderId: order.id,
        saleId: existingByPayment.id,
        receiptId: existingReceipt?.id ?? '',
      };
    }

    // Decodificar metadatos del pago (tipoPago, etc.) desde notes (JSON al final).
    const meta = this.parseNotes(payment.notes ?? null);

    const sale = await this.saleRepo.create({
      orderId: order.id,
      clienteId: order.clienteId,
      clienteNombre: order.cliente,
      asesorId: order.asesorId,
      asesorNombre: order.asesor,
      fechaVenta: (payment.paidAt ?? new Date()).toISOString(),
      subtotal: order.subtotal ?? order.total,
      impuestos: order.impuestos ?? 0,
      descuentos: order.descuentos ?? 0,
      total: order.total,
      estado: 'COMPLETADA',
      medioPago: input.medioPago ?? payment.method,
      paymentId: payment.id,
      tipoPago: meta.tipoPago,
      numeroCuota: meta.numeroCuota,
      totalCuotas: meta.totalCuotas,
      esAnticipo: meta.esAnticipo,
      esSaldo: meta.esSaldo,
      paymentStatus: 'APPROVED',
      comprobantePagoUrl: payment.comprobantePagoUrl ?? null,
      registradoPorId: payment.asesorId ?? null,
    });

    await this._historyRepo.create({
      pedidoId: order.id,
      usuarioId: payment.asesorId ?? undefined,
      accion: 'VENTA_REGISTRADA_MANUAL',
      estadoAnterior: order.estado,
      estadoNuevo: order.estado,
      informacion: { saleId: sale.id, paymentId: payment.id, observaciones: input.observaciones },
    });

    if (this.eventBus) {
      this.eventBus.publish({
        type: 'order.accepted',
        occurredAt: new Date(),
        payload: {
          orderId: order.id,
          orderNumero: order.numero,
          clienteId: order.clienteId,
          clienteNombre: order.cliente,
          asesorId: order.asesorId,
          asesorNombre: order.asesor,
          saleId: sale.id,
          receiptId: '',
          total: order.total,
        },
      });
    }

    return { orderId: order.id, saleId: sale.id, receiptId: '' };
  }

  private parseNotes(notes: string | null): {
    tipoPago: string | null;
    numeroCuota: number | null;
    totalCuotas: number | null;
    esAnticipo: boolean | null;
    esSaldo: boolean | null;
  } {
    if (!notes) return { tipoPago: null, numeroCuota: null, totalCuotas: null, esAnticipo: null, esSaldo: null };
    try {
      const last = notes.split('|').map((s) => s.trim()).reverse().find((s) => s.startsWith('{') && s.endsWith('}'));
      if (!last) throw new Error('no json');
      const parsed = JSON.parse(last) as Record<string, unknown>;
      return {
        tipoPago: typeof parsed.tipoPago === 'string' ? parsed.tipoPago : null,
        numeroCuota: typeof parsed.numeroCuota === 'number' ? parsed.numeroCuota : null,
        totalCuotas: typeof parsed.totalCuotas === 'number' ? parsed.totalCuotas : null,
        esAnticipo: typeof parsed.esAnticipo === 'boolean' ? parsed.esAnticipo : null,
        esSaldo: typeof parsed.esSaldo === 'boolean' ? parsed.esSaldo : null,
      };
    } catch {
      return { tipoPago: null, numeroCuota: null, totalCuotas: null, esAnticipo: null, esSaldo: null };
    }
  }
}
