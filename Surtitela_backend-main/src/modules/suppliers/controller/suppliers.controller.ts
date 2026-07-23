import { Request, Response } from "express";
import { respuestaBadRequest, respuestaConflict, respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import { validateFields, ValidationError } from "../../../shared/validation.js";
import { getAllSuppliers, createSupplier, deleteSupplier } from "../service/suppliers.service.js";

export async function listSuppliers(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllSuppliers();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreateSupplier(req: Request, res: Response): Promise<Response> {
  const { name, phone, email, address } = req.body;
  const validationErrors: ValidationError[] = validateFields(req.body, {
    name: { required: true, max: 100 },
    phone: { exact: 10, pattern: /^[0-9]+$/ },
    email: { max: 100, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    address: { max: 150 },
  });
  if (validationErrors.length) {
    return respuestaBadRequest(res, "Validación de campos fallida", validationErrors);
  }

  try {
    const data = await createSupplier({ name, phone, email, address });
    if (!data) return respuestaConflict(res, "No se pudo crear proveedor");
    return res.status(201).json({ status: "success", data, message: "Proveedor creado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeleteSupplier(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deleteSupplier(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Proveedor eliminado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
