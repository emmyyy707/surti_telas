import { Role } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../../../shared/domain/errors';

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw new UnauthorizedError();
    if (!roles.includes(req.user.role)) throw new ForbiddenError('Rol no autorizado');
    next();
  };

export const requirePermission =
  (code: string) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw new UnauthorizedError();
    if (req.user.role === 'ADMIN') return next();
    if (!req.user.permissions.includes(code)) {
      throw new ForbiddenError(`Requiere el permiso "${code}"`);
    }
    next();
  };
