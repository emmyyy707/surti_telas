import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requireRole } from '../../../auth/presentation/middlewares/authorize';
import { returnsUseCases } from '../../infrastructure/container/returnsContainer';

export const clientReturnRouter = Router();

clientReturnRouter.use(authenticate);

clientReturnRouter.post(
  '/',
  requireRole('CLIENTE'),
  asyncHandler(async (req: any, res: any) => {
    const input = {
      ...req.body,
      cliente: req.user?.nombre || req.body.cliente,
      clienteId: req.user?.id,
      estado: 'RECIBIDO',
      destino: req.body.destino || 'REINGRESO_INVENTARIO',
    };
    const ret = await returnsUseCases.createReturn.execute(input);
    return res.status(201).json({ success: true, data: ret.toDTO(), message: 'Devolución reportada' });
  })
);

clientReturnRouter.get(
  '/',
  requireRole('CLIENTE'),
  asyncHandler(async (req: any, res: any) => {
    const filters = {
      ...req.query,
      cliente: req.user?.nombre,
    };
    const result = await returnsUseCases.listReturns.execute(filters);
    return res.json({ success: true, data: result.data, meta: result.meta });
  })
);
