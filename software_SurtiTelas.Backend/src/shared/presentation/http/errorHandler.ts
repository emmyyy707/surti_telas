import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../../domain/errors';
import { logger } from '../../infrastructure/logger';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const bodyErr = err as { status?: number; type?: string };
  if (bodyErr.type === 'entity.parse.failed') {
    return res
      .status(400)
      .json({ success: false, error: 'bad_request', message: 'Cuerpo JSON inválido' });
  }

  if (err instanceof ZodError) {
    const first = err.errors[0];
    const message = first ? `${first.path.join('.') || 'campo'}: ${first.message}` : 'Error de validación';
    return res
      .status(422)
      .json({ success: false, error: 'validation_error', message, details: err.errors });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) ?? [];
      return res
        .status(409)
        .json({ success: false, error: 'conflict', message: `Registro duplicado: ${target.join(', ')}` });
    }
    if (err.code === 'P2025') {
      return res
        .status(404)
        .json({ success: false, error: 'not_found', message: 'Recurso no encontrado' });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res
      .status(400)
      .json({ success: false, error: 'bad_request', message: 'Datos inválidos para la base de datos' });
  }

  if (err instanceof ValidationError) {
    return res
      .status(err.status)
      .json({ success: false, error: err.code, message: err.message, details: err.details });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({ success: false, error: err.code, message: err.message });
  }

  logger.error('[UnhandledError]', { requestId: req.requestId, error: (err as Error).message, stack: (err as Error).stack });
  return res.status(500).json({ success: false, error: 'internal', message: 'Error interno del servidor', requestId: req.requestId });
};
