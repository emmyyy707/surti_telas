import { Request, Response } from "express";
import { respuestaBadRequest, respuestaExitosa, respuestaError, respuestaIdInvalido, respuestaNotFound, respuestaConflict } from "../../../shared/http.js";
import { validateFields, ValidationError } from "../../../shared/validation.js";
import { userCreateSchema, userUpdateSchema } from "../../../shared/validationSchemas.js";
import { usersService } from "../../../shared/dependencies.js";

export async function listUsers(req: Request, res: Response): Promise<Response> {
  try {
    const data = await usersService.getAllUsers();
    // filter by role if query.rol provided
    if (req.query.rol) {
      const role = String(req.query.rol);
      const filtered = data.filter(u => u.roles?.name === role);
      return respuestaExitosa(res, filtered);
    }
    return respuestaExitosa(res, data);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleCreateUser(req: Request, res: Response): Promise<Response> {
  const { name, last_name, email, password, phone, company, address, id_document_type, id_role } = req.body;
  const validationErrors: ValidationError[] = validateFields(req.body, userCreateSchema);
  if (validationErrors.length) {
    return respuestaBadRequest(res, "Validación de campos fallida", validationErrors);
  }

  try {
    const data = await usersService.createUser({ name, last_name, email, password, phone, company, address, id_document_type, id_role });
    if (!data) return respuestaConflict(res, "No se pudo crear usuario");
    return res.status(201).json({ status: "success", data, message: "Usuario creado" });
  } catch (error: any) {
    if (error?.name === "ProtectedPrincipalAdminError") {
      return res.status(403).json({ status: "error", message: error.message });
    }
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleGetUserById(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const data = await usersService.getUserById(id);
    if (!data) return res.status(404).json({ status: "error", message: "Usuario no encontrado" });
    const { password, ...publicUser } = data;
    return respuestaExitosa(res, publicUser);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleUpdateUser(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  const { name, last_name, email, password, phone, address, status, id_role } = req.body;
  const validationErrors: ValidationError[] = validateFields(req.body, userUpdateSchema);
  if (validationErrors.length) {
    return res.status(400).json({ status: "error", message: validationErrors[0].message });
  }

  try {
    const data = await usersService.updateUser(id, { name, last_name, email, password, phone, address, status, id_role });
    if (!data) return res.status(404).json({ status: "error", message: "No se pudo actualizar usuario" });
    return respuestaExitosa(res, data, "Usuario actualizado");
  } catch (error: any) {
    if (error?.name === "ProtectedPrincipalAdminError") {
      return res.status(403).json({ status: "error", message: error.message });
    }
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleDeleteUser(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  try {
    const success = await usersService.deleteUser(id);
    if (!success) return res.status(404).json({ status: "error", message: "No encontrado" });
    return res.status(200).json({ status: "success", message: "Usuario eliminado" });
  } catch (error: any) {
    if (error?.name === "ProtectedPrincipalAdminError") {
      return res.status(403).json({ status: "error", message: error.message });
    }
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleToggleUser(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);
  try {
    const data = await usersService.toggleUserStatus(id);
    if (!data) return respuestaNotFound(res);
    return respuestaExitosa(res, data);
  } catch (error: any) {
    if (error?.name === "ProtectedPrincipalAdminError") {
      return res.status(403).json({ status: "error", message: error.message });
    }
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleResetUsers(_req: Request, res: Response): Promise<Response> {
  try {
    const result = await usersService.resetUsers();
    return respuestaExitosa(res, result);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function handleUpdateUserRole(req: Request, res: Response): Promise<Response> {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return respuestaIdInvalido(res);

  const { id_role } = req.body;
  if (!id_role) {
    return res.status(400).json({ status: "error", message: "id_role es requerido" });
  }

  try {
    const data = await usersService.updateUser(id, { id_role });
    if (!data) return res.status(404).json({ status: "error", message: "No se pudo actualizar usuario" });
    return respuestaExitosa(res, data, "Rol actualizado");
  } catch (error: any) {
    if (error?.name === "ProtectedPrincipalAdminError") {
      return res.status(403).json({ status: "error", message: error.message });
    }
    console.error(error);
    return respuestaError(res);
  }
}