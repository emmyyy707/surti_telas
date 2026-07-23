import { RequestHandler, Request, Response, NextFunction } from "express";

export type ErrorDetail = {
  field?: string;
  message: string;
};

// Respuesta estándar para éxito con datos opcionales
export function respuestaExitosa(res: Response, data: unknown, mensaje = "Operación exitosa", status = 200): Response {
  return res.status(status).json({ status: "success", message: mensaje, data });
}

// Respuesta estándar para errores del servidor o de la petición
export function respuestaError(res: Response, mensaje = "Error interno del servidor", status = 500, errors?: ErrorDetail[]): Response {
  const payload: { status: "error"; message: string; errors?: ErrorDetail[] } = {
    status: "error",
    message: mensaje,
  };

  if (errors && errors.length > 0) {
    payload.errors = errors;
  }

  return res.status(status).json(payload);
}

export function respuestaBadRequest(res: Response, mensaje = "Datos inválidos", errors?: ErrorDetail[]): Response {
  return respuestaError(res, mensaje, 400, errors);
}

export function respuestaUnauthorized(res: Response, mensaje = "No autorizado"): Response {
  return respuestaError(res, mensaje, 401);
}

export function respuestaForbidden(res: Response, mensaje = "Acceso denegado"): Response {
  return respuestaError(res, mensaje, 403);
}

export function respuestaNotFound(res: Response, mensaje = "Recurso no encontrado"): Response {
  return respuestaError(res, mensaje, 404);
}

export function respuestaConflict(res: Response, mensaje = "Conflicto en la petición"): Response {
  return respuestaError(res, mensaje, 409);
}

// Respuesta cuando un ID es inválido
export function respuestaIdInvalido(res: Response, mensaje = "ID inválido"): Response {
  return respuestaBadRequest(res, mensaje);
}

// Envuelve un controlador asincrónico para manejar errores de forma centralizada
export function manejarAsync(handler: RequestHandler): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      console.error(error);
      respuestaError(res);
    }
  };
}
