import { Request, Response, NextFunction } from "express";
import prisma from "../../config/prisma.js";
import { respuestaConflict, respuestaBadRequest } from "../../shared/http.js";

export async function emailExistsMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { email } = req.body;
  if (!email) return next();

  const existingUser = await prisma.users.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    res.status(409).json({ status: "error", message: "El correo ya está registrado" });
    return;
  }

  next();
}

export async function documentNumberExistsMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { document_number } = req.body;
  if (!document_number) return next();

  const existingUser = await prisma.users.findFirst({
    where: { document_number },
  });

  if (existingUser) {
    res.status(409).json({ status: "error", message: "El número de documento ya está registrado" });
    return;
  }

  next();
}

export async function userExistsMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ status: "error", message: "ID de usuario inválido" });
    return;
  }

  const user = await prisma.users.findUnique({ where: { id_user: id } });
  if (!user) {
    res.status(404).json({ status: "error", message: "Usuario no encontrado" });
    return;
  }

  (req as any).existingUser = user;
  next();
}

export async function productExistsMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ status: "error", message: "ID de producto inválido" });
    return;
  }

  const product = await prisma.products.findUnique({ where: { id_product: id } });
  if (!product) {
    res.status(404).json({ status: "error", message: "Producto no encontrado" });
    return;
  }

  (req as any).existingProduct = product;
  next();
}

export async function roleExistsMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { id_role } = req.body;
  if (!id_role) return next();

  const role = await prisma.roles.findUnique({ where: { id_role } });
  if (!role) {
    res.status(400).json({ status: "error", message: "Rol no encontrado" });
    return;
  }

  next();
}

export async function principalAdminProtectionMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const id = Number(req.params.id);
  const PRINCIPAL_ADMIN_EMAIL = process.env.PRINCIPAL_ADMIN_EMAIL?.trim().toLowerCase();

  if (!PRINCIPAL_ADMIN_EMAIL) return next();

  const user = await prisma.users.findUnique({
    where: { id_user: id },
    select: { email: true },
  });

  if (user?.email.toLowerCase() === PRINCIPAL_ADMIN_EMAIL) {
    res.status(403).json({ status: "error", message: "El Administrador Principal no puede ser modificado" });
    return;
  }

  next();
}