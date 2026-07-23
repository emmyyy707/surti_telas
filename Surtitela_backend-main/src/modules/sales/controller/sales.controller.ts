import { Request, Response } from "express";
import { respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import { getAllSales, createSale, deleteSale } from "../service/sales.service.js";

export async function listSales(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllSales();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreateSale(req: Request, res: Response): Promise<Response> {
  const { sale_date, quantity, unit_value, vat_value, discount_value, total_value, id_customer, id_order } = req.body;

  try {
    const data = await createSale({ sale_date, quantity, unit_value, vat_value, discount_value, total_value, id_customer, id_order });
    if (!data) return res.status(409).json({ status: "error", message: "Error" });
    return res.status(201).json({ status: "success", data, message: "Venta creada" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeleteSale(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deleteSale(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Venta eliminada" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
