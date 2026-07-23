import { Request, Response } from "express";
import { respuestaExitosa, respuestaError, respuestaIdInvalido, respuestaUnauthorized } from "../../../shared/http.js";
import { AuthRequest } from "../../../shared/auth.js";
import { orderUseCase } from "../../../shared/dependencies.js";

export async function listOrders(req: Request, res: Response): Promise<Response> {
  const authReq = req as AuthRequest;
  const user = authReq.user;
  if (!user) return respuestaUnauthorized(res, "No autorizado");

  try {
    const { status, clienteId } = req.query;
    const clienteFilter = clienteId ? Number(clienteId) : undefined;
    const data = await orderUseCase.list({
      status: status ? String(status) : undefined,
      id_customer: clienteFilter,
      role: user.role,
      userId: user.id_user,
    });
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function getOrder(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const data = await orderUseCase.getById(id);
    if (!data) return res.status(404).json({ status: "error", message: "Orden no encontrada" });
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreateOrder(req: Request, res: Response): Promise<Response> {
  const { order_date, quantity, subtotal, total, id_customer, items } = req.body;

  try {
    const data = await orderUseCase.create({ order_date, quantity, subtotal, total, id_customer, items });
    if (!data) return res.status(409).json({ status: "error", message: "Error" });
    return res.status(201).json(data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleUpdateOrder(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);
  const { order_date, quantity, subtotal, total, id_customer, status } = req.body;

  try {
    const data = await orderUseCase.update(id, { order_date, quantity, subtotal, total, id_customer, status });
    if (!data) return res.status(404).json({ status: "error", message: "Orden no encontrada" });
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleUpdateOrderStatus(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  const { status } = req.body;
  if (Number.isNaN(id) || !status) return respuestaIdInvalido(res);

  try {
    const data = await orderUseCase.updateStatus(id, String(status));
    if (!data) return res.status(404).json({ status: "error", message: "Orden no encontrada" });
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleOrderPayment(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  const { payment_date, amount, status } = req.body;
  if (Number.isNaN(id) || !payment_date || amount === undefined) return respuestaIdInvalido(res);

  try {
    const payment = await orderUseCase.pay(id, { payment_date, amount: Number(amount), status });
    if (!payment) return res.status(409).json({ status: "error", message: "No se pudo registrar pago" });
    return respuestaExitosa(res, payment, "Pago registrado");
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeleteOrder(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await orderUseCase.delete(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
