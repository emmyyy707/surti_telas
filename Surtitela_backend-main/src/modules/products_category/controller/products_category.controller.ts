import { Request, Response } from "express";
import { respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import { getAllProductCategories, createProductCategory, deleteProductCategory } from "../service/products_category.service.js";

export async function listProductCategories(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllProductCategories();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreateProductCategory(req: Request, res: Response): Promise<Response> {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ status: "error", message: "name requerido" });

  try {
    const data = await createProductCategory({ name, description });
    if (!data) return res.status(409).json({ status: "error", message: "Error" });
    return res.status(201).json({ status: "success", data, message: "Categoría creada" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeleteProductCategory(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deleteProductCategory(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Categoría eliminada" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
