import { Request, Response } from 'express';
import { ok, created, noContent } from '../../../../shared/presentation/http/HttpResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { PaymentFiltersSchema, CreatePaymentSchema, UpdatePaymentStatusSchema, UpdatePaymentSchema } from '../validators/payment.validators';
import { paymentUseCases } from '../../infrastructure/container/paymentContainer';
import type { PaymentStatus } from '../../domain/entities/Payment';

export const listPayments = async (req: Request, res: Response) => {
  const filters = parseDto(PaymentFiltersSchema, req.query);
  if (req.user?.role === 'ASESOR') {
    filters.asesorId = req.user.id;
  } else if (req.user?.role === 'CLIENTE') {
    filters.customerId = req.user.id;
  }
  const data = await paymentUseCases.listPayments.execute(filters as { customerId?: string; asesorId?: string; status?: PaymentStatus });
  return ok(res, { items: data, meta: { totalRecords: data.length, page: 1, limit: data.length, totalPages: 1 } });
};

export const getPayment = async (req: Request, res: Response) => {
  const payment = await paymentUseCases.getPaymentById.execute(req.params.id);
  if (!payment) {
    return res.status(404).json({ success: false, error: 'not_found', message: 'Pago no encontrado' });
  }
  return ok(res, payment);
};

export const createPayment = async (req: Request, res: Response) => {
  console.log('E2E DEBUG createPayment body=', JSON.stringify(req.body), 'user=', req.user?.id, req.user?.role);
  const input = parseDto(CreatePaymentSchema, req.body);
  console.log('E2E DEBUG createPayment input=', JSON.stringify(input));
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
