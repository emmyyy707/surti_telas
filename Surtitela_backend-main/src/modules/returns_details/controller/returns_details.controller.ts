import { Request, Response } from "express";
import { respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import { getAllReturnDetails, createReturnDetail, deleteReturnDetail } from "../service/returns_details.service.js";

export async function listReturnDetails(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllReturnDetails();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreateReturnDetail(req: Request, res: Response): Promise<Response> {
  const { quantity, subtotal, id_return, id_product } = req.body;
  if (!quantity) return res.status(400).json({ status: "error", message: "quantity requerido" });

  try {
    const data = await createReturnDetail({ quantity, subtotal, id_return, id_product });
    if (!data) return res.status(409).json({ status: "error", message: "Error" });
    return res.status(201).json({ status: "success", data, message: "Detalle creado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeleteReturnDetail(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deleteReturnDetail(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Detalle eliminado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
