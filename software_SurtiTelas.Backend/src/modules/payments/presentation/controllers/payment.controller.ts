import { Request, Response } from 'express';
import { ok, created, noContent } from '../../../../shared/presentation/http/HttpResponse';
import { buildApiPaginatedResponse } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { PaymentFiltersSchema, CreatePaymentSchema, UpdatePaymentStatusSchema, UpdatePaymentSchema } from '../validators/payment.validators';
import { paymentUseCases } from '../../infrastructure/container/paymentContainer';
import type { PaymentStatus } from '../../domain/entities/Payment';
import { PDFDocument, StandardFonts } from 'pdf-lib';

export const listPayments = async (req: Request, res: Response) => {
  const filters = parseDto(PaymentFiltersSchema, req.query);
  if (req.user?.role === 'ASESOR') {
    filters.asesorId = req.user.id;
  } else if (req.user?.role === 'CLIENTE') {
    filters.customerId = req.user.id;
  }
  const result = await paymentUseCases.listPayments.execute(filters as { customerId?: string; asesorId?: string; status?: PaymentStatus });
  const response = buildApiPaginatedResponse(
    result.data,
    result.total,
    1,
    result.data.length,
    null
  );
  return ok(res, response);
};

export const getPayment = async (req: Request, res: Response) => {
  const payment = await paymentUseCases.getPaymentById.execute(req.params.id);
  if (!payment) {
    return res.status(404).json({ success: false, error: 'not_found', message: 'Pago no encontrado' });
  }
  return ok(res, payment);
};

export const createPayment = async (req: Request, res: Response) => {
  const input = parseDto(CreatePaymentSchema, req.body);
  const payment = await paymentUseCases.createPayment.execute({
    ...input,
    asesorId: req.user?.role === 'ASESOR' ? req.user.id : input.asesorId,
  });
  return created(res, payment, 'Pago creado');
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  const { status } = parseDto(UpdatePaymentStatusSchema, req.body);
  const payment = await paymentUseCases.updatePaymentStatus.execute(req.params.id, status);
  return ok(res, payment, 'Estado del pago actualizado');
};

export const updatePayment = async (req: Request, res: Response) => {
  const changes = parseDto(UpdatePaymentSchema, req.body);
  const payment = await paymentUseCases.updatePayment.execute(req.params.id, changes);
  return ok(res, payment, 'Pago actualizado');
};

export const deletePayment = async (req: Request, res: Response) => {
  await paymentUseCases.deletePayment.execute(req.params.id);
  return noContent(res);
};

export const getCustomerBalance = async (req: Request, res: Response) => {
  const customerId = req.params.customerId;
  const balance = await paymentUseCases.getCustomerBalance.execute(customerId);
  return ok(res, balance, 'Saldo calculado');
};

export const getQuoteBalance = async (req: Request, res: Response) => {
  const quoteId = req.params.quoteId;
  const balance = await paymentUseCases.getQuoteBalance.execute(quoteId);
  return ok(res, balance, 'Saldo de cotización calculado');
};

export const exportPaymentPdf = async (req: Request, res: Response) => {
  const payment = await paymentUseCases.getPaymentById.execute(req.params.id);
  if (!payment) {
    return res.status(404).json({ success: false, error: 'not_found', message: 'Pago no encontrado' });
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  page.drawText('Comprobante de Pago', { x: 50, y: 800, size: 20, font: boldFont });
  page.drawText(`ID: ${payment.id}`, { x: 50, y: 770, size: 12, font });
  page.drawText(`Orden: ${payment.orderId}`, { x: 50, y: 750, size: 12, font });
  page.drawText(`Cliente: ${payment.customerId}`, { x: 50, y: 730, size: 12, font });
  page.drawText(`Monto: $${payment.amount.toFixed(2)}`, { x: 50, y: 710, size: 12, font });
  page.drawText(`Método: ${payment.method}`, { x: 50, y: 690, size: 12, font });
  page.drawText(`Estado: ${payment.status}`, { x: 50, y: 670, size: 12, font });
  page.drawText(`Referencia: ${payment.reference ?? 'N/A'}`, { x: 50, y: 650, size: 12, font });
  page.drawText(`Notas: ${payment.notes ?? 'N/A'}`, { x: 50, y: 630, size: 12, font });
  page.drawText(`Fecha: ${new Date(payment.createdAt).toLocaleString()}`, { x: 50, y: 610, size: 12, font });

  const pdfBytes = await pdfDoc.save();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="pago-${payment.id}.pdf"`);
  res.send(Buffer.from(pdfBytes));
  return;
};
