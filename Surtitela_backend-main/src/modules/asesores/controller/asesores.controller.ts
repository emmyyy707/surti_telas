import { Request, Response } from "express";
import { respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import {
  getAllAsesores,
  getAsesorById,
  getClientesDeAsesor,
  getPedidosDeAsesor,
  getComisionesAsesor,
} from "../service/asesores.service.js";

export async function listAsesores(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllAsesores();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function getAsesor(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const data = await getAsesorById(id);
    if (!data) return res.status(404).json({ status: "error", message: "Asesor no encontrado" });
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function getAsesorClientes(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);
  try {
    const data = await getClientesDeAsesor(id);
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function getAsesorPedidos(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);
  try {
    const data = await getPedidosDeAsesor(id);
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function getAsesorComisiones(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);
  try {
    const data = await getComisionesAsesor(id);
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
