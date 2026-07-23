import { Request, Response } from "express";
import { respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import { getAllWorkshops, createWorkshop, deleteWorkshop } from "../service/workshops.service.js";

export async function listWorkshops(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllWorkshops();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreateWorkshop(req: Request, res: Response): Promise<Response> {
  const { name, phone, address } = req.body;
  if (!name) return res.status(400).json({ status: "error", message: "name requerido" });

  try {
    const data = await createWorkshop({ name, phone, address });
    if (!data) return res.status(409).json({ status: "error", message: "Error" });
    return res.status(201).json({ status: "success", data, message: "Taller creado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeleteWorkshop(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deleteWorkshop(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Taller eliminado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
