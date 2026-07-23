import { Request, Response } from "express";
import { respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import { getAllProductionDetails, createProductionDetail, deleteProductionDetail } from "../service/production_details.service.js";

export async function listProductionDetails(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllProductionDetails();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreateProductionDetail(req: Request, res: Response): Promise<Response> {
  const { quantity_delivered, amount_received, date_received, delivery_date, id_production } = req.body;

  try {
    const data = await createProductionDetail({ quantity_delivered, amount_received, date_received, delivery_date, id_production });
    if (!data) return res.status(409).json({ status: "error", message: "Error" });
    return res.status(201).json({ status: "success", data, message: "Detalle creado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeleteProductionDetail(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deleteProductionDetail(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Detalle eliminado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
