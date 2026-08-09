import { Router } from 'express';
import { asyncHandler } from '../../../../shared/presentation/http/asyncHandler';
import { authenticate } from '../../../auth/presentation/middlewares/authenticate';
import { requireRole } from '../../../auth/presentation/middlewares/authorize';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { buildApiPaginatedResponse } from '../../../../shared/presentation/http/PaginatedResponse';
import { CreateReturnSchema } from '../../presentation/validators/return.validators';
import { returnsUseCases } from '../../infrastructure/container/returnsContainer';

export const clientReturnRouter = Router();

clientReturnRouter.post(
  '/',
  authenticate,
  requireRole('CLIENTE'),
  asyncHandler(async (req: any, res: any) => {
    const input = {
      ...req.body,
      cliente: req.user?.nombre || req.body.cliente,
      clienteId: req.user?.id,
      estado: 'RECIBIDO',
      destino: req.body.destino || 'REINGRESO_INVENTARIO',
    };
    const validated = parseDto(CreateReturnSchema, input);
    const ret = await returnsUseCases.createReturn.execute(validated);
    return res.status(201).json({ success: true, data: ret.toDTO(), message: 'Devolución reportada' });
  })
);

clientReturnRouter.get(
  '/',
  authenticate,
  requireRole('CLIENTE'),
  asyncHandler(async (req: any, res: any) => {
    const filters = {
      ...req.query,
      clienteId: req.user?.id,
      cliente: req.user?.nombre,
    };
    const result = await returnsUseCases.listReturns.execute(filters);
    const response = buildApiPaginatedResponse(
      result.data,
      result.meta.total,
      result.meta.page,
      result.meta.limit,
      result.meta.nextCursor
    );
    return res.json({ success: true, data: response });
  })
);

clientReturnRouter.get(
  '/debug',
  authenticate,
  asyncHandler(async (_req: any, res: any) => {
    const result = await returnsUseCases.listReturns.execute({});
    const response = buildApiPaginatedResponse(
      result.data,
      result.meta.total,
      result.meta.page,
      result.meta.limit,
      result.meta.nextCursor
    );
    return res.json({ success: true, data: response });
  })
);

clientReturnRouter.get(
  '/public-debug',
  asyncHandler(async (_req: any, res: any) => {
    const result = await returnsUseCases.listReturns.execute({});
    const response = buildApiPaginatedResponse(
      result.data,
      result.meta.total,
      result.meta.page,
      result.meta.limit,
      result.meta.nextCursor
    );
    return res.json({ success: true, data: response });
  })
);
