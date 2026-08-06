import { Request, Response } from 'express';
import { ok } from '../../../../shared/presentation/http/HttpResponse';
import { AlertInventoryService } from '../../infrastructure/services/AlertService';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { z } from 'zod';
import { BadRequestError } from '../../../../shared/domain/errors';

const AlertQuerySchema = z.object({
  productId: z.string().optional(),
});

const alertService = new AlertInventoryService();

export const checkInventoryAlerts = async (_req: Request, res: Response) => {
  await alertService.checkLowStock();
  return ok(res, { message: 'Alertas de inventario verificadas' });
};

export const getProductRecommendations = async (req: Request, res: Response) => {
  const body = parseDto(AlertQuerySchema, req.query);
  if (!body.productId) throw new BadRequestError('productId es requerido');
  const recs = await alertService.getProductRecommendations(body.productId);
  return ok(res, { recommendations: recs });
};


