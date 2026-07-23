import { Request, Response } from "express";
import { respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import { getAllReturns, createReturn, deleteReturn } from "../service/returns.service.js";

export async function listReturns(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllReturns();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreateReturn(req: Request, res: Response): Promise<Response> {
  const { return_date, reason, id_order } = req.body;
  if (!return_date) return res.status(400).json({ status: "error", message: "return_date requerido" });

  try {
    const data = await createReturn({ return_date, reason, id_order });
    if (!data) return res.status(409).json({ status: "error", message: "Error" });
    return res.status(201).json({ status: "success", data, message: "Devolución creada" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeleteReturn(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deleteReturn(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Devolución eliminada" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
