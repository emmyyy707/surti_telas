import { Request, Response } from "express";
import { respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import { getAllRoles, createRole, deleteRole } from "../service/roles.service.js";

export async function listRoles(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllRoles();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreateRole(req: Request, res: Response): Promise<Response> {
  const { name, description, id_permission } = req.body;
  if (!name) return res.status(400).json({ status: "error", message: "name requerido" });

  try {
    const data = await createRole({ name, description, id_permission });
    if (!data) return res.status(409).json({ status: "error", message: "Error" });
    return res.status(201).json({ status: "success", data, message: "Rol creado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeleteRole(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deleteRole(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Rol eliminado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
