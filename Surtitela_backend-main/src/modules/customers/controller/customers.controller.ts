import { Request, Response } from "express";
import { respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import { getAllCustomers, getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } from "../service/customers.service.js";

export async function listCustomers(req: Request, res: Response): Promise<Response> {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const result = await getCustomers({ page: 1, limit: 1000, search });
    return res.status(200).json(result.data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function getCustomer(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const data = await getCustomerById(id);
    if (!data) return res.status(404).json({ status: "error", message: "Cliente no encontrado" });
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreateCustomer(req: Request, res: Response): Promise<Response> {
  const { id_user, status } = req.body;

  try {
    const data = await createCustomer({ id_user, status });
    if (!data) return res.status(409).json({ status: "error", message: "Error" });
    return res.status(201).json(data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleUpdateCustomer(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);
  const { id_user, status } = req.body;

  try {
    const data = await updateCustomer(id, { id_user, status });
    if (!data) return res.status(404).json({ status: "error", message: "Cliente no encontrado" });
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeleteCustomer(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deleteCustomer(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
