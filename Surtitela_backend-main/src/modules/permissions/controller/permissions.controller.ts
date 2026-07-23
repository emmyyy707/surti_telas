import { Request, Response } from "express";
import { respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import { getAllPermissions, createPermission, deletePermission } from "../service/permissions.service.js";

export async function listPermissions(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllPermissions();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreatePermission(req: Request, res: Response): Promise<Response> {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ status: "error", message: "name requerido" });

  try {
    const data = await createPermission({ name, description });
    if (!data) return res.status(409).json({ status: "error", message: "Error" });
    return res.status(201).json({ status: "success", data, message: "Permiso creado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeletePermission(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deletePermission(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Permiso eliminado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
