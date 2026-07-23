import { Request, Response } from "express";
import { respuestaBadRequest, respuestaExitosa, respuestaError } from "../../../shared/http.js";
import { createCheckout } from "../service/checkout.service.js";

const PAYMENT_METHODS = [
  { provider: "Bancolombia", type: "immediate" },
  { provider: "Davivienda", type: "immediate" },
  { provider: "BBVA", type: "immediate" },
  { provider: "Banco de Bogotá", type: "immediate" },
  { provider: "Nequi", type: "immediate" },
];

export async function handleCheckout(req: Request, res: Response): Promise<Response> {
  const { clienteId, carrito, banco, tipoPago, cuotas, total, comprobante, items, customerId, paymentMethod, installments, amount, paymentProof } = req.body;
  const normalizedClienteId = clienteId ?? customerId;
  const normalizedCarrito = carrito ?? items;
  const normalizedBanco = banco ?? paymentMethod;
  const normalizedTipoPago = tipoPago ?? (installments && Number(installments) > 1 ? "installments" : "immediate");
  const normalizedCuotas = cuotas ?? installments;
  const normalizedTotal = total ?? amount;
  const normalizedComprobante = comprobante ?? paymentProof;

  if (!normalizedClienteId) {
    return respuestaBadRequest(res, "clienteId es requerido");
  }
  if (!Array.isArray(normalizedCarrito) || normalizedCarrito.length === 0) {
    return respuestaBadRequest(res, "El carrito no puede estar vacío");
  }
  if (!normalizedBanco || String(normalizedBanco).trim() === "") {
    return respuestaBadRequest(res, "El banco es obligatorio");
  }
  if (!normalizedTipoPago || !["immediate", "installments"].includes(String(normalizedTipoPago))) {
    return respuestaBadRequest(res, "El tipo de pago es inválido");
  }
  if (String(normalizedTipoPago) === "installments") {
    const cuotasNumber = Number(normalizedCuotas);
    if (!Number.isInteger(cuotasNumber) || cuotasNumber <= 0) {
      return respuestaBadRequest(res, "Las cuotas deben ser un número entero mayor a cero");
    }
  }
  if (normalizedTotal === undefined || normalizedTotal === null || Number.isNaN(Number(normalizedTotal))) {
    return respuestaBadRequest(res, "El total es obligatorio y debe ser numérico");
  }
  if (!normalizedComprobante || String(normalizedComprobante).trim() === "") {
    return respuestaBadRequest(res, "El comprobante es obligatorio");
  }

  try {
    const data = await createCheckout({ clienteId: normalizedClienteId, carrito: normalizedCarrito, banco: normalizedBanco, tipoPago: normalizedTipoPago, cuotas: normalizedCuotas, total: normalizedTotal, comprobante: normalizedComprobante });
    if (!data) return res.status(409).json({ status: "error", message: "No se pudo procesar checkout" });
    return res.status(201).json({ status: "success", data, message: "Checkout procesado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function getPaymentMethods(_req: Request, res: Response): Promise<Response> {
  return respuestaExitosa(res, PAYMENT_METHODS);
}
