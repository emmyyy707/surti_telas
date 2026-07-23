import { Request, Response } from "express";
import { respuestaBadRequest, respuestaConflict, respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import { validateFields, ValidationError } from "../../../shared/validation.js";
import { getAllDeliveries, createDelivery, deleteDelivery } from "../service/deliveries.service.js";

export async function listDeliveries(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllDeliveries();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreateDelivery(req: Request, res: Response): Promise<Response> {
  const { total, address, city, phone, id_customer, id_employee, id_order } = req.body;
  const validationErrors: ValidationError[] = validateFields(req.body, {
    address: { max: 150 },
    city: { max: 50 },
    phone: { exact: 10, pattern: /^[0-9]+$/ },
  });
  if (validationErrors.length) {
    return respuestaBadRequest(res, "Validación de campos fallida", validationErrors);
  }

  try {
    const data = await createDelivery({ total, address, city, phone, id_customer, id_employee, id_order });
    if (!data) return respuestaConflict(res, "No se pudo crear entrega");
    return res.status(201).json({ status: "success", data, message: "Entrega creada" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeleteDelivery(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deleteDelivery(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Entrega eliminada" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
