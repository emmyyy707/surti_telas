import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { respuestaUnauthorized, respuestaForbidden } from "./http.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export interface AuthUser {
  id_user: number;
  email: string;
  role: string;
  permissions?: string[];
  name: string;
  last_name: string;
  phone?: string | null;
  address?: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export async function verifyToken(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return respuestaUnauthorized(res, "Token no proporcionado");
  }

  const token = authorization.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      id_user: number;
      email: string;
      role?: string;
      permissions?: string[];
      name?: string;
      last_name?: string;
      phone?: string | null;
      address?: string | null;
    };

    let authUser: AuthUser | null = null;

    if (payload.role && payload.name && payload.last_name) {
      authUser = {
        id_user: payload.id_user,
        email: payload.email,
        role: payload.role ?? "cliente",
        permissions: payload.permissions ?? [],
        name: payload.name ?? "",
        last_name: payload.last_name ?? "",
        phone: payload.phone,
        address: payload.address,
      };
    } else {
      const user = await prisma.users.findUnique({
        where: { id_user: payload.id_user },
        select: {
          id_user: true,
          email: true,
          name: true,
          last_name: true,
          phone: true,
          address: true,
          roles: { select: { name: true } },
        },
      });

      if (!user) {
        return respuestaUnauthorized(res, "Token inválido");
      }

      authUser = {
        id_user: user.id_user,
        email: user.email,
        role: user.roles?.name ?? "cliente",
        permissions: [],
        name: user.name,
        last_name: user.last_name,
        phone: user.phone,
        address: user.address,
      };
    }

    (req as AuthRequest).user = authUser;
    next();
  } catch (error) {
    console.error(error);
    return respuestaUnauthorized(res, "Token inválido");
  }
}

export function authorizeRoles(...allowedRoles: string[]): RequestHandler {
  return (req, res, next) => {
    const authReq = req as AuthRequest;
    const role = authReq.user?.role;
    if (!role || !allowedRoles.includes(role)) {
      return respuestaForbidden(res, "Acceso denegado");
    }
    next();
  };
}
