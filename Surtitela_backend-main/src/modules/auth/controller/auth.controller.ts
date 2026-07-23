import { Request, Response } from "express";
import { authUseCase } from "../../../shared/dependencies.js";
import { validateFieldsMiddleware, emailValidation, passwordValidation, documentTypeValidation, ValidationError } from "../../../shared/middlewares/validation.middleware.js";
import { emailExistsMiddleware, documentNumberExistsMiddleware } from "../../../shared/middlewares/database.middleware.js";
import { respuestaBadRequest, respuestaConflict, respuestaUnauthorized } from "../../../shared/http.js";
import { authLoginSchema, authRegisterSchema } from "../../../shared/validationSchemas.js";
import { googleLogin } from "../service/google.service.js";
import { sendWelcomeEmail } from "../service/email.service.js";

const registerValidations = validateFieldsMiddleware({}, authRegisterSchema);
const loginValidations = validateFieldsMiddleware({}, authLoginSchema);

export async function login(req: Request, res: Response): Promise<Response> {
  const { email, password } = req.body;

  if (!emailValidation(email)) {
    return respuestaBadRequest(res, "Formato de correo inválido");
  }

  if (!passwordValidation(password)) {
    return respuestaBadRequest(res, "La contraseña debe tener al menos 8 caracteres");
  }

  const result = await authUseCase.login(email, password);
  if (!result) {
    return respuestaUnauthorized(res, "Credenciales inválidas");
  }

  return res.status(200).json({
    success: true,
    message: "Usuario autenticado correctamente",
    token: result.token,
    user: {
      id: String(result.user.id_user),
      email: result.user.email,
      role: result.user.role,
      name: result.user.nombre ? String(result.user.nombre) : [result.user.name, result.user.last_name].filter(Boolean).join(" "),
    },
  });
}

export async function register(req: Request, res: Response): Promise<Response> {
  const { name, last_name, email, password, confirmPassword, phone, document_type, document_number } = req.body;

  if (!name || !last_name) {
    return respuestaBadRequest(res, "Nombre y apellido son requeridos");
  }

  if (!emailValidation(email)) {
    return respuestaBadRequest(res, "Formato de correo inválido");
  }

  if (!passwordValidation(password)) {
    return respuestaBadRequest(res, "La contraseña debe tener al menos 8 caracteres");
  }

  if (password !== confirmPassword) {
    return respuestaBadRequest(res, "La confirmación de contraseña no coincide");
  }

  if (!documentTypeValidation(document_type)) {
    return respuestaBadRequest(res, "Tipo de documento inválido");
  }

  if (!document_number || document_number.length < 5 || document_number.length > 20) {
    return respuestaBadRequest(res, "Número de documento inválido");
  }

  const result = await authUseCase.register({
    name,
    last_name,
    email,
    password,
    phone: phone || null,
    document_type,
    document_number,
  });

  if (!result) {
    return respuestaConflict(res, "El correo ya está registrado");
  }

  await sendWelcomeEmail(email, `${result.user.name} ${result.user.last_name}`);

  return res.status(201).json({
    success: true,
    message: "Usuario registrado correctamente",
    token: result.token,
    user: result.user,
  });
}

export async function refresh(req: Request, res: Response): Promise<Response> {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return respuestaBadRequest(res, "refreshToken es requerido");
  }

  const result = await authUseCase.refreshToken(refreshToken);
  if (!result) {
    return respuestaUnauthorized(res, "Refresh token inválido");
  }

  return res.status(200).json({
    success: true,
    message: "Token renovado correctamente",
    token: result.token,
    user: {
      id_user: result.user.id_user,
      email: result.user.email,
      role: result.user.role,
      nombre: result.user.nombre,
    },
  });
}

export async function me(req: Request, res: Response): Promise<Response> {
  const user = (req as any).user;
  if (!user) return respuestaUnauthorized(res, "No autorizado");
  return res.status(200).json({
    success: true,
    message: "Usuario obtenido correctamente",
    user: user,
  });
}

export async function google(req: Request, res: Response): Promise<Response> {
  const { idToken } = req.body;
  if (!idToken) {
    return respuestaBadRequest(res, "idToken es requerido");
  }

  const result = await googleLogin(idToken);
  if (!result) {
    return respuestaUnauthorized(res, "Token de Google inválido");
  }

  return res.status(200).json({
    success: true,
    message: "Usuario autenticado con Google",
    token: result.token,
    user: result.user,
  });
}

export async function requestPasswordReset(req: Request, res: Response): Promise<Response> {
  const { email } = req.body;
  const user = await (await import("../../../config/prisma.js")).default.users.findUnique({ where: { email: String(email).toLowerCase() } });
  if (!user) {
    return res.status(200).json({ success: true, message: "Si el correo existe, recibirás instrucciones" });
  }

  const { randomUUID } = await import("crypto");
  const token = randomUUID();
  await (await import("../../../config/prisma.js")).default.users.update({
    where: { id_user: user.id_user },
    data: {
      password_reset_token: token,
      password_reset_expires: new Date(Date.now() + 1000 * 60 * 60),
    },
  });

  return res.status(200).json({ success: true, message: "Si el correo existe, recibirás instrucciones" });
}

export async function resetPassword(req: Request, res: Response): Promise<Response> {
  const { token, password } = req.body;
  const prisma = (await import("../../../config/prisma.js")).default;
  const user = await prisma.users.findFirst({ where: { password_reset_token: String(token) } });
  if (!user || !user.password_reset_expires || user.password_reset_expires < new Date()) {
    return respuestaBadRequest(res, "Token inválido o expirado");
  }

  const bcrypt = await import("bcrypt");
  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.users.update({
    where: { id_user: user.id_user },
    data: {
      password: hashedPassword,
      password_reset_token: null,
      password_reset_expires: null,
    },
  });

  return res.status(200).json({ success: true, message: "Contraseña restaurada correctamente" });
}

export async function verifyEmail(req: Request, res: Response): Promise<Response> {
  const { token } = req.body;
  const prisma = (await import("../../../config/prisma.js")).default;
  const user = await prisma.users.findFirst({ where: { email_verification_token: String(token) } });
  if (!user) {
    return respuestaBadRequest(res, "Token de verificación inválido");
  }

  await prisma.users.update({
    where: { id_user: user.id_user },
    data: {
      email_verified: true,
      email_verification_token: null,
    },
  });

  return res.status(200).json({ success: true, message: "Correo verificado correctamente" });
}

export async function logout(_req: Request, res: Response): Promise<Response> {
  return res.status(200).json({ success: true, message: "Sesión cerrada correctamente" });
}