import { Request, Response } from "express";
import { respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import { getAllOrderDetails, createOrderDetail, deleteOrderDetail } from "../service/orders_details.service.js";

export async function listOrderDetails(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllOrderDetails();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreateOrderDetail(req: Request, res: Response): Promise<Response> {
  const { id_order, id_product, quantity, unit_value, subtotal } = req.body;

  try {
    const data = await createOrderDetail({ id_order, id_product, quantity, unit_value, subtotal });
    if (!data) return res.status(409).json({ status: "error", message: "Error" });
    return res.status(201).json({ status: "success", data, message: "Detalle creado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeleteOrderDetail(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deleteOrderDetail(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Detalle eliminado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
