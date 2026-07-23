import { Request, Response } from "express";
import { respuestaExitosa, respuestaError, respuestaIdInvalido } from "../../../shared/http.js";
import { getAllEmployees, createEmployee, deleteEmployee } from "../service/employees.service.js";

export async function listEmployees(_req: Request, res: Response): Promise<Response> {
  try {
    const data = await getAllEmployees();
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreateEmployee(req: Request, res: Response): Promise<Response> {
  const { hire_date, salary, id_user } = req.body;

  try {
    const data = await createEmployee({ hire_date, salary, id_user });
    if (!data) return res.status(409).json({ status: "error", message: "Error" });
    return res.status(201).json({ status: "success", data, message: "Empleado creado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeleteEmployee(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await deleteEmployee(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Empleado eliminado" });
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}
