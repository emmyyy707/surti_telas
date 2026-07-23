import { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../../../../shared/domain/errors';
import { tokenService } from '../../infrastructure/container/authContainer';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Falta token de acceso');
  }
  const token = header.slice('Bearer '.length);
  req.user = tokenService.verifyAccessToken(token);
  next();
};
