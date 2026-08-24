import { Request, Response, NextFunction } from 'express';

export const crossPanelEventEmitter = async (_req: Request, _res: Response, next: NextFunction) => {
  next();
};
