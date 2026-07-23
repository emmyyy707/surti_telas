import { Request, Response } from "express";
import { respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import { getAllPurchasingDetails, createPurchasingDetail, deletePurchasingDetail } from "../service/purchasing_details.service.js";

export async function listPurchasingDetails(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllPurchasingDetails();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreatePurchasingDetail(req: Request, res: Response): Promise<Response> {
  const { quantity, unit_value, subtotal, id_purchase, id_product } = req.body;
  if (!quantity || !unit_value) return res.status(400).json({ status: "error", message: "quantity y unit_value requeridos" });

  try {
    const data = await createPurchasingDetail({ quantity, unit_value, subtotal, id_purchase, id_product });
    if (!data) return res.status(409).json({ status: "error", message: "Error" });
    return res.status(201).json({ status: "success", data, message: "Detalle creado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeletePurchasingDetail(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deletePurchasingDetail(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Detalle eliminado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
