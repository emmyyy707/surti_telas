import { Request, Response } from "express";
import { respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import { getAllProductions, createProduction, deleteProduction } from "../service/productions.service.js";

export async function listProductions(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllProductions();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreateProduction(req: Request, res: Response): Promise<Response> {
  const { id_workshop, id_product } = req.body;

  try {
    const data = await createProduction({ id_workshop, id_product });
    if (!data) return res.status(409).json({ status: "error", message: "Error" });
    return res.status(201).json({ status: "success", data, message: "Producción creada" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeleteProduction(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deleteProduction(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Producción eliminada" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
