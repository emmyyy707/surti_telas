import { Request, Response } from "express";
import { respuestaBadRequest, respuestaExitosa, respuestaError, respuestaUnauthorized, respuestaNotFound } from "../../../shared/http.js";
import { validateFields, ValidationError } from "../../../shared/validation.js";
import { AuthRequest } from "../../../shared/auth.js";
import { usersService } from "../../users/service/users.service.js";

export async function getProfile(req: Request, res: Response): Promise<Response> {
  const user = (req as AuthRequest).user;
  if (!user) return respuestaUnauthorized(res, "No autorizado");

  try {
    const data = await usersService.getUserById(user.id_user);
    if (!data) return res.status(404).json({ status: "error", message: "Usuario no encontrado" });
    const { password, ...publicUser } = data;
    return respuestaExitosa(res, publicUser);
  } catch (error) {
    console.error(error);
    return respuestaError(res);
  }
}

export async function updateProfile(req: Request, res: Response): Promise<Response> {
  const user = (req as AuthRequest).user;
  if (!user) return res.status(401).json({ status: "error", message: "No autorizado" });

  const { name, last_name, email, phone, address, password } = req.body;
  const validationErrors: ValidationError[] = validateFields(req.body, {
    name: { max: 50 },
    last_name: { max: 50 },
    email: { max: 100, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { min: 8, max: 128 },
    phone: { exact: 10, pattern: /^[0-9]+$/ },
    address: { max: 150 },
  });
  if (validationErrors.length) {
    return respuestaBadRequest(res, "Validación de campos fallida", validationErrors);
  }

  try {
    const data = await usersService.updateUser(user.id_user, { name, last_name, email, phone, address, password });
    if (!data) return res.status(404).json({ status: "error", message: "No se pudo actualizar profile" });
    return respuestaExitosa(res, data, "Perfil actualizado");
  } catch (error: any) {
    if (error?.name === "ProtectedPrincipalAdminError") {
      return res.status(403).json({ status: "error", message: error.message });
    }
    console.error(error);
    return respuestaError(res);
  }
}
