import { Request, Response } from 'express';
import { NotFoundError } from '../../../../shared/domain/errors';
import { ok, created, noContent } from '../../../../shared/presentation/http/HttpResponse';
import { buildApiPaginatedResponse } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import {
  CreateSaleSchema,
  CancelSaleSchema,
  AddSaleItemSchema,
  SaleFiltersSchema,
} from '../validators/sale.validators';
import { salesOrderUseCases } from '../../infrastructure/container/salesOrderContainer';
import { ReceiptPdfGenerator } from '../../infrastructure/services/ReceiptPdfGenerator';
import { Order } from '../../../orders/domain/entities/Order';
import { Sale } from '../../domain/entities/Sale';
import { Receipt } from '../../../receipts/domain/entities/Receipt';
import { CompanyConfig } from '../../../company/domain/entities/CompanyConfig';
import { prisma } from '../../../../config/database';
import { toOrderData, type OrderRow } from '../../../orders/infrastructure/mappers/OrderMapper';

export const listSales = async (req: Request, res: Response) => {
  const filters = parseDto(SaleFiltersSchema, req.query);
  const result = await salesOrderUseCases.getSales.execute({
    search: filters.search,
    estado: filters.estado,
    clienteId: filters.clienteId,
    asesorId: filters.asesorId,
    desde: filters.desde,
    hasta: filters.hasta,
    page: filters.page,
    limit: filters.limit,
    orderId: (req.query.orderId as string | undefined) ?? undefined,
    paymentStatus: (req.query.paymentStatus as string | undefined) ?? undefined,
    tipoPago: (req.query.tipoPago as string | undefined) ?? undefined,
    numeroCuota: req.query.numeroCuota ? Number(req.query.numeroCuota) : undefined,
    medioPago: (req.query.medioPago as string | undefined) ?? undefined,
  });

  return ok(res, buildApiPaginatedResponse(result.items, result.total, result.page, result.limit));
};

export const getSale = async (req: Request, res: Response) => {
  const sale = await salesOrderUseCases.getSaleById.execute(req.params.id);
  return ok(res, sale);
};

export const createSale = async (req: Request, res: Response) => {
  const input = parseDto(CreateSaleSchema, req.body);
  const result = await salesOrderUseCases.createSale.execute({
    orderId: input.orderId,
    paymentId: input.paymentId,
    medioPago: input.medioPago ?? 'CASH',
    observaciones: input.observaciones,
  });
  return created(res, result, 'Venta registrada');
};

export const cancelSale = async (req: Request, res: Response) => {
  const { motivoAnulacion } = parseDto(CancelSaleSchema, req.body);
  await salesOrderUseCases.cancelSale.execute(req.params.id, motivoAnulacion);
  return ok(res, { success: true }, 'Venta anulada correctamente');
};

export const addSaleItem = async (req: Request, res: Response) => {
  const input = parseDto(AddSaleItemSchema, req.body);
  await salesOrderUseCases.addSaleItem.execute(req.params.id, {
    nombre: input.nombre,
    precio: input.precio,
    cantidad: input.cantidad,
    productId: input.productId,
  });
  return ok(res, { success: true }, 'Producto agregado a la venta');
};

export const removeSaleItem = async (req: Request, res: Response) => {
  const { itemId } = req.params;
  await salesOrderUseCases.removeSaleItem.execute(req.params.id, itemId);
  return ok(res, { success: true }, 'Producto eliminado de la venta');
};

export const deleteSale = async (req: Request, res: Response) => {
  await salesOrderUseCases.deleteSale.execute(req.params.id);
  return noContent(res);
};

export const generateSalePdf = async (req: Request, res: Response) => {
  const sale = await salesOrderUseCases.getSaleById.execute(req.params.id);
  if (!sale) throw new NotFoundError('Venta no encontrada');

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
    fechaVenta: sale.fechaVenta,
    subtotal: sale.subtotal,
    impuestos: sale.impuestos,
    descuentos: sale.descuentos,
    total: sale.total,
    estado: sale.estado,
    motivoAnulacion: sale.motivoAnulacion,
    medioPago: sale.medioPago,
    createdAt: sale.createdAt,
    updatedAt: sale.updatedAt,
  });

  const result = await ReceiptPdfGenerator.generate(order, saleEntity, receipt, company);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(result.html);
};
