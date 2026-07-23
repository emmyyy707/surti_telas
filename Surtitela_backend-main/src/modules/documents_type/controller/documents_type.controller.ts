import { Request, Response } from "express";
import { respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import { getAllDocumentTypes, createDocumentType, deleteDocumentType } from "../service/documents_type.service.js";

export async function listDocumentTypes(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllDocumentTypes();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "Error al listar tipos de documento" });
  }
}

export async function handleCreateDocumentType(req: Request, res: Response): Promise<Response> {
  const { document_type } = req.body;

  if (!document_type) {
    return res.status(400).json({ status: "error", message: "El campo document_type es requerido" });
  }

  try {
    const data = await createDocumentType({ document_type });
    if (!data) return res.status(409).json({ status: "error", message: "Error al crear" });
    return res.status(201).json({ status: "success", data, message: "Tipo de documento creado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "Error al crear tipo de documento" });
  }
}

export async function handleDeleteDocumentType(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deleteDocumentType(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Tipo de documento eliminado" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "error", message: "Error al eliminar" });
  }
}
