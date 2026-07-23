import { Request, Response } from "express";
import { respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import { getAllSupplies, createSupply, deleteSupply } from "../service/supplies.service.js";

export async function listSupplies(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllSupplies();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreateSupply(req: Request, res: Response): Promise<Response> {
  const { name, stock, id_product_category } = req.body;
  if (!name) return res.status(400).json({ status: "error", message: "name requerido" });

  try {
    const data = await createSupply({ name, stock, id_product_category });
    if (!data) return res.status(409).json({ status: "error", message: "Error" });
    return res.status(201).json({ status: "success", data, message: "Insumo creado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeleteSupply(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deleteSupply(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Insumo eliminado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
