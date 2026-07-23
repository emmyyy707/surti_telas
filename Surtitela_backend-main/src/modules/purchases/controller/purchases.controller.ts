import { Request, Response } from "express";
import { respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import { getAllPurchases, createPurchase, deletePurchase } from "../service/purchases.service.js";

export async function listPurchases(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllPurchases();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreatePurchase(req: Request, res: Response): Promise<Response> {
  const { purchase_date, total, id_supplier } = req.body;
  if (!purchase_date) return res.status(400).json({ status: "error", message: "purchase_date requerido" });

  try {
    const data = await createPurchase({ purchase_date, total, id_supplier });
    if (!data) return res.status(409).json({ status: "error", message: "Error" });
    return res.status(201).json({ status: "success", data, message: "Compra creada" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeletePurchase(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deletePurchase(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Compra eliminada" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
