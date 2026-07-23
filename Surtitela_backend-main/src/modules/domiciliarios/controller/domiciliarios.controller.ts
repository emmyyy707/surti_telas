import { Request, Response } from "express";
import { respuestaBadRequest, respuestaConflict, respuestaExitosa, respuestaError, respuestaIdInvalido, respuestaNotFound } from "../../../shared/http.js";
import { validateFields, ValidationError } from "../../../shared/validation.js";
import {
  getAllDomiciliarios,
  getDomiciliarioById,
  createDomiciliario,
  updateDomiciliario,
  deleteDomiciliario,
} from "../service/domiciliarios.service.js";

export async function listDomiciliarios(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllDomiciliarios();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function getDomiciliario(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const data = await getDomiciliarioById(id);
    if (!data) return res.status(404).json({ status: "error", message: "Domiciliario no encontrado" });
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreateDomiciliario(req: Request, res: Response): Promise<Response> {
  const { nombre, email, password, phone, address, status } = req.body;
  if (!nombre || !email || !password) {
    return respuestaBadRequest(res, "Campos requeridos: nombre, email, password");
  }

  const validationErrors: ValidationError[] = validateFields(req.body, {
    nombre: { required: true, max: 50 },
    email: { required: true, max: 100, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { required: true, min: 8, max: 128 },
    phone: { exact: 10, pattern: /^[0-9]+$/ },
    address: { max: 150 },
  });
  if (validationErrors.length) {
    return respuestaBadRequest(res, "Validación de campos fallida", validationErrors);
  }

  try {
    const data = await createDomiciliario({ nombre, email, password, phone, address, status });
    if (!data) return respuestaConflict(res, "No se pudo crear domiciliario");
    return res.status(201).json({ status: "success", data, message: "Domiciliario creado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleUpdateDomiciliario(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);
  const { status, phone, address } = req.body;
  const validationMessage = validateFields(req.body, {
    phone: { exact: 10, pattern: /^[0-9]+$/ },
    address: { max: 150 },
  });
  if (validationMessage) {
    return res.status(400).json({ status: "error", message: validationMessage });
  }

  try {
    const data = await updateDomiciliario(id, { status, phone, address });
    if (!data) return res.status(404).json({ status: "error", message: "No se pudo actualizar domiciliario" });
    return respuestaExitosa(res, data, "Domiciliario actualizado");
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeleteDomiciliario(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deleteDomiciliario(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Domiciliario eliminado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
