import { Request, Response } from 'express';
import { ok } from '../../../../shared/presentation/http/HttpResponse';

export const healthCheck = async (_req: Request, res: Response) => {
  return ok(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

export const backupDatabase = async (_req: Request, res: Response) => {
  res.status(501).send('Backups automáticos no implementados en este entorno');
};
