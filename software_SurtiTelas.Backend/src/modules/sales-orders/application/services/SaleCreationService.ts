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
}

export class SaleCreationService {
  constructor(
    private readonly saleRepo: SaleRepository,
    private readonly receiptRepo: ReceiptRepository,
  ) {}

  async createSaleAndReceipt(
    order: Order,
    usuarioId: string,
    medioPago?: string,
    requestId?: string,
  ): Promise<SaleCreationResult> {
    logger.info('[SaleCreationService] Iniciando creación de venta y recibo', {
      requestId,
      orderId: order.id,
      orderNumero: order.numero,
    });

    let saleId: string | undefined;
    let receiptId: string | undefined;

    try {
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
        });
        saleId = sale.id;

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

        const updated = await tx.order.update({
          where: { id: order.id },
          data: { estado: 'RECIBO_GENERADO' },
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
            accion: 'VENTA_REGISTRADA',
            estadoAnterior: order.estado,
            estadoNuevo: 'Recibo generado',
            informacion: { saleId: sale.id, receiptId: receipt.id },
          },
        });

        return updated;
      });

      logger.info('[SaleCreationService] Venta y recibo creados exitosamente', {
        requestId,
        orderId: order.id,
        saleId,
        receiptId,
      });

      return { saleId: saleId!, receiptId: receiptId!, orderNumero: order.numero, orderRow: result as unknown as OrderRow };
    } catch (error) {
      logger.error('[SaleCreationService] Error creando venta y recibo', {
        requestId,
        orderId: order.id,
        saleId,
        receiptId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
