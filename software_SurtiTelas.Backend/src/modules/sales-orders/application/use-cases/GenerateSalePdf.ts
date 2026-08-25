import { NotFoundError } from '../../../../shared/domain/errors';
import { Order } from '../../../orders/domain/entities/Order';
import { Sale } from '../../domain/entities/Sale';
import { Receipt } from '../../../receipts/domain/entities/Receipt';
import { CompanyConfig } from '../../../company/domain/entities/CompanyConfig';
import { ReceiptPdfGenerator } from '../../infrastructure/services/ReceiptPdfGenerator';
import { prisma } from '../../../../config/database';
import { toOrderData, type OrderRow } from '../../../orders/infrastructure/mappers/OrderMapper';

export class GenerateSalePdf {
  async execute(saleId: string): Promise<{ html: string }> {
    const sale = await prisma.sale.findFirst({
      where: { id: saleId, deletedAt: null },
    });

    if (!sale) {
      throw new NotFoundError('Venta no encontrada');
    }

    const orderRow = await prisma.order.findFirst({
      where: { id: sale.orderId, deletedAt: null },
      include: {
        cliente: true,
        asesor: true,
        items: true,
        usuarioValidacion: true,
        comprobantePagoCargadoPor: true,
      },
    });

    if (!orderRow) throw new NotFoundError('Pedido asociado no encontrado');

    const order = new Order(toOrderData(orderRow as unknown as OrderRow));

    const receiptRow = await prisma.receipt.findFirst({
      where: { orderId: sale.orderId, deletedAt: null },
    });

    const receipt = receiptRow
      ? new Receipt({
          id: receiptRow.id,
          orderId: receiptRow.orderId ?? undefined,
          customerId: receiptRow.customerId,
          numero: receiptRow.numero,
          total: Number(receiptRow.total),
          concepto: receiptRow.concepto ?? '',
          notas: receiptRow.notas ?? undefined,
          url: receiptRow.url ?? undefined,
          emitidoPor: receiptRow.emitidoPor ?? undefined,
          emitidoAt: receiptRow.emitidoAt.toISOString(),
          estado: receiptRow.estado,
          estadoEnvio: receiptRow.estadoEnvio ?? undefined,
          fechaEnvio: receiptRow.fechaEnvio?.toISOString(),
          intentosEnvio: receiptRow.intentosEnvio ?? undefined,
          ultimoErrorEnvio: receiptRow.ultimoErrorEnvio ?? undefined,
          createdAt: receiptRow.createdAt.toISOString(),
          updatedAt: receiptRow.updatedAt.toISOString(),
        })
      : new Receipt({
          id: '',
          orderId: order.id,
          customerId: order.clienteId,
          numero: `REC-${order.numero.replace('PED-', '')}`,
          total: order.total,
          concepto: `Venta ${order.numero} - ${order.items} ítems`,
          emitidoPor: order.asesor,
          emitidoAt: new Date().toISOString(),
          estado: 'BORRADOR',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

    const companyRow = await prisma.companyConfig.findUnique({ where: { id: 'company' } });
    const company = companyRow
      ? new CompanyConfig({
          id: companyRow.id,
          nombre: companyRow.nombre,
          nit: companyRow.nit ?? undefined,
          telefono: companyRow.telefono ?? undefined,
          email: companyRow.email ?? undefined,
          direccion: companyRow.direccion ?? undefined,
          ciudad: companyRow.ciudad ?? undefined,
          logo: companyRow.logo ?? undefined,
          moneda: companyRow.moneda,
          createdAt: companyRow.createdAt,
          updatedAt: companyRow.updatedAt,
        })
      : new CompanyConfig({ nombre: 'SurtiTelas', moneda: 'COP' });

    const saleEntity = new Sale({
      id: sale.id,
      orderId: sale.orderId,
      clienteId: sale.clienteId,
      clienteNombre: sale.clienteNombre,
      asesorId: sale.asesorId,
      asesorNombre: sale.asesorNombre,
      fechaVenta: sale.fechaVenta.toISOString(),
      subtotal: Number(sale.subtotal),
      impuestos: Number(sale.impuestos),
      descuentos: Number(sale.descuentos),
      total: Number(sale.total),
      estado: sale.estado,
      motivoAnulacion: sale.motivoAnulacion ?? undefined,
      medioPago: sale.medioPago ?? undefined,
      createdAt: sale.createdAt.toISOString(),
      updatedAt: sale.updatedAt.toISOString(),
    });

    const result = await ReceiptPdfGenerator.generate(order, saleEntity, receipt, company);

    return { html: result.html };
  }
}
