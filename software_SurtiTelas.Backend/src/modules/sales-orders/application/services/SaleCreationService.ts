import { prisma } from '../../../../config/database';
import type { Order } from '../../../orders/domain/entities/Order';
import type { OrderRow } from '../../../orders/infrastructure/mappers/OrderMapper';
import type { SaleRepository } from '../../domain/repositories/SaleRepository';
import type { ReceiptRepository } from '../../../receipts/domain/repositories/ReceiptRepository';
import { logger } from '../../../../shared/infrastructure/logger';

export interface SaleCreationResult {
  saleId: string;
  receiptId: string;
  orderNumero: string;
  orderRow: OrderRow;
  /** Indica si la venta ya existía por idempotencia (no se creó nueva). */
  alreadyExisted?: boolean;
}

/**
 * Contexto adicional cuando la venta se origina a partir de un Payment
 * confirmado (modelo "1 venta por pago"). Todos los campos son opcionales
 * para mantener compatibilidad con el flujo legacy.
 */
export interface SalePaymentContext {
  paymentId?: string;
  tipoPago?: 'PAGO_INMEDIATO' | 'ABONO_INICIAL' | 'CUOTA' | 'PAGO_SALDO' | string;
  numeroCuota?: number;
  totalCuotas?: number;
  esAnticipo?: boolean;
  esSaldo?: boolean;
  paymentStatus?: string;
  comprobantePagoUrl?: string;
  registradoPorId?: string;
}

export class SaleCreationService {
  constructor(
    private readonly saleRepo: SaleRepository,
    private readonly receiptRepo: ReceiptRepository,
  ) {}

  /**
   * Crea una venta (y un recibo si no existe) a partir de un pedido.
   *
   * Reglas:
   *  - Si `paymentContext.paymentId` está presente y ya existe una venta
   *    asociada a ese pago, retorna la existente (idempotencia).
   *  - Si no hay `paymentId`, sigue el flujo legacy (1 venta por pedido).
   *  - Nunca se asigna `RECIBO_GENERADO` dos veces: si el pedido ya está
   *    en ese estado, se omite la actualización.
   */
  async createSaleAndReceipt(
    order: Order,
    usuarioId: string,
    medioPago?: string,
    requestId?: string,
    paymentContext?: SalePaymentContext,
  ): Promise<SaleCreationResult> {
    logger.info('[SaleCreationService] Iniciando creación de venta y recibo', {
      requestId,
      orderId: order.id,
      orderNumero: order.numero,
      paymentId: paymentContext?.paymentId,
      tipoPago: paymentContext?.tipoPago,
    });

    let saleId: string | undefined;
    let receiptId: string | undefined;
    let alreadyExisted = false;

    try {
      // 1) Idempotencia: si ya existe una venta para este paymentId, retornarla.
      if (paymentContext?.paymentId) {
        const existing = await this.saleRepo.findByPaymentId(paymentContext.paymentId);
        if (existing) {
          alreadyExisted = true;
          saleId = existing.id;
          logger.info('[SaleCreationService] Venta ya existía para paymentId (idempotente)', {
            requestId,
            paymentId: paymentContext.paymentId,
            saleId: existing.id,
          });
          const orderRow = await prisma.order.findUnique({
            where: { id: order.id },
            include: {
              cliente: true,
              asesor: true,
              usuarioValidacion: true,
              comprobantePagoCargadoPor: true,
              items: true,
            },
          });
          return {
            saleId: existing.id,
            receiptId: '',
            orderNumero: order.numero,
            orderRow: orderRow as unknown as OrderRow,
            alreadyExisted: true,
          };
        }
      }

      // Verificamos el estado actual del pedido fuera de la transacción para
      // minimizar dependencias con el callback `tx` (compat con tests).
      const current = await prisma.order.findUnique({
        where: { id: order.id },
        select: { estado: true },
      });
      const crearReciboEnTx = !paymentContext?.paymentId;
      const shouldMarkRecibo =
        crearReciboEnTx &&
        current &&
        current.estado !== 'RECIBO_GENERADO' &&
        current.estado !== 'RECIBO_ENVIADO';

      const result = await prisma.$transaction(async (tx) => {
        const resolvedMedioPago = medioPago ?? order.medioPago ?? 'CASH';

        const sale = await this.saleRepo.create({
          orderId: order.id,
          clienteId: order.clienteId,
          clienteNombre: order.cliente,
          asesorId: order.asesorId,
          asesorNombre: order.asesor,
          fechaVenta: new Date().toISOString(),
          subtotal: order.subtotal ?? order.total,
          impuestos: order.impuestos ?? 0,
          descuentos: order.descuentos ?? 0,
          total: order.total,
          estado: 'COMPLETADA',
          medioPago: resolvedMedioPago,
          paymentId: paymentContext?.paymentId ?? null,
          tipoPago: paymentContext?.tipoPago ?? null,
          numeroCuota: paymentContext?.numeroCuota ?? null,
          totalCuotas: paymentContext?.totalCuotas ?? null,
          esAnticipo: paymentContext?.esAnticipo ?? null,
          esSaldo: paymentContext?.esSaldo ?? null,
          paymentStatus: paymentContext?.paymentStatus ?? 'APPROVED',
          comprobantePagoUrl: paymentContext?.comprobantePagoUrl ?? null,
          registradoPorId: paymentContext?.registradoPorId ?? usuarioId ?? null,
        });
        saleId = sale.id;

        // Solo crear recibo en el primer pago (legacy / pago inmediato total).
        // Para abonos y cuotas NO creamos recibo (lo emite el admin al final).
        const crearReciboEnTx = !paymentContext?.paymentId;
        if (crearReciboEnTx) {
          const receiptNumero = `REC-${order.numero.replace('PED-', '')}`;
          const receipt = await this.receiptRepo.create({
            orderId: order.id,
            customerId: order.clienteId,
            numero: receiptNumero,
            total: order.total,
            concepto: `Venta ${order.numero} - ${order.items} ítems`,
            emitidoPor: order.asesor,
          });
          receiptId = receipt.id;
        }

        const updated = shouldMarkRecibo
          ? await tx.order.update({
              where: { id: order.id },
              data: { estado: 'RECIBO_GENERADO' },
              include: {
                cliente: true,
                asesor: true,
                usuarioValidacion: true,
                comprobantePagoCargadoPor: true,
                items: true,
              },
            })
          : await tx.order.findUnique({
              where: { id: order.id },
              include: {
                cliente: true,
                asesor: true,
                usuarioValidacion: true,
                comprobantePagoCargadoPor: true,
                items: true,
              },
            });

        await tx.orderHistory.create({
          data: {
            pedidoId: order.id,
            usuarioId,
            accion: paymentContext?.paymentId ? 'PAGO_REGISTRADO' : 'VENTA_REGISTRADA',
            estadoAnterior: order.estado,
            estadoNuevo: shouldMarkRecibo ? 'Recibo generado' : current?.estado ?? order.estado,
            informacion: paymentContext?.paymentId
              ? {
                  saleId: sale.id,
                  paymentId: paymentContext.paymentId,
                  tipoPago: paymentContext.tipoPago,
                  numeroCuota: paymentContext.numeroCuota,
                  totalCuotas: paymentContext.totalCuotas,
                  esAnticipo: paymentContext.esAnticipo,
                  esSaldo: paymentContext.esSaldo,
                  amount: order.total,
                }
              : { saleId: sale.id, receiptId: receiptId },
          },
        });

        return updated;
      });

      logger.info('[SaleCreationService] Venta y recibo creados exitosamente', {
        requestId,
        orderId: order.id,
        saleId,
        receiptId,
        paymentId: paymentContext?.paymentId,
        alreadyExisted,
      });

      return {
        saleId: saleId!,
        receiptId: receiptId ?? '',
        orderNumero: order.numero,
        orderRow: result as unknown as OrderRow,
        alreadyExisted,
      };
    } catch (error) {
      logger.error('[SaleCreationService] Error creando venta y recibo', {
        requestId,
        orderId: order.id,
        saleId,
        receiptId,
        paymentId: paymentContext?.paymentId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
