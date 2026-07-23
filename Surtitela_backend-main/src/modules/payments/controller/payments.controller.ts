import { Request, Response } from "express";
import { respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import { getAllPayments, createPayment, deletePayment } from "../service/payments.service.js";

export async function listPayments(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllPayments();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreatePayment(req: Request, res: Response): Promise<Response> {
  const { payment_date, amount, id_order } = req.body;
  if (!payment_date || amount === undefined) return res.status(400).json({ status: "error", message: "payment_date y amount requeridos" });

  try {
    const data = await createPayment({ payment_date, amount: Number(amount), id_order });
    if (!data) return res.status(409).json({ status: "error", message: "Error" });
    return res.status(201).json({ status: "success", data, message: "Pago creado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleUploadPaymentReceipt(req: Request, res: Response): Promise<Response> {
  const file = (req as any).file;
  if (!file) {
    return res.status(400).json({ status: "error", message: "Archivo comprobante requerido" });
  }

  const url = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
  return res.status(201).json({ status: "success", comprobanteUrl: url });
}

export async function handleDeletePayment(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deletePayment(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Pago eliminado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
