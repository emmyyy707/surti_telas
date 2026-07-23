import { Request, Response } from "express";
import { respuestaBadRequest, respuestaConflict, respuestaExitosa, respuestaError, respuestaIdInvalido, respuestaNotFound } from "../../../shared/http.js";
import { validateFields, ValidationError } from "../../../shared/validation.js";
import {
  getAllDomicilios,
  getDomicilioById,
  getRutaDomicilios,
  getHistorialDomicilios,
  getEntregasByDomiciliario,
  createDomicilio,
  updateDomicilio,
  deleteDomicilio,
} from "../service/domicilios.service.js";

export async function listDomicilios(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllDomicilios();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function getDomicilio(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const data = await getDomicilioById(id);
    if (!data) return res.status(404).json({ status: "error", message: "Domicilio no encontrado" });
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function listRutaDomicilios(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getRutaDomicilios();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function listHistorialDomicilios(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getHistorialDomicilios();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function getEntregasDomiciliario(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const data = await getEntregasByDomiciliario(id);
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreateDomicilio(req: Request, res: Response): Promise<Response> {
  const { id_employee, id_order, address, city, phone, total, status } = req.body;
  const validationErrors: ValidationError[] = validateFields(req.body, {
    address: { max: 150 },
    city: { max: 50 },
    phone: { exact: 10, pattern: /^[0-9]+$/ },
  });
  if (validationErrors.length) {
    return respuestaBadRequest(res, "Validación de campos fallida", validationErrors);
  }

  try {
    const data = await createDomicilio({ id_employee, id_order, address, city, phone, total, status });
    if (!data) return respuestaConflict(res, "No se pudo crear domicilio");
    return res.status(201).json({ status: "success", data, message: "Domicilio creado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleUpdateDomicilio(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);
  const { id_employee, address, city, phone, total, status } = req.body;
  const validationErrors: ValidationError[] = validateFields(req.body, {
    address: { max: 150 },
    city: { max: 50 },
    phone: { exact: 10, pattern: /^[0-9]+$/ },
  });
  if (validationErrors.length) {
    return respuestaBadRequest(res, "Validación de campos fallida", validationErrors);
  }

  try {
    const data = await updateDomicilio(id, { id_employee, address, city, phone, total, status });
    if (!data) return res.status(404).json({ status: "error", message: "No se pudo actualizar domicilio" });
    return respuestaExitosa(res, data, "Domicilio actualizado");
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeleteDomicilio(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deleteDomicilio(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Domicilio eliminado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
