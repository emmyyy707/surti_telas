import { Request, Response } from 'express';
import { ok, created, noContent } from '../../../../shared/presentation/http/HttpResponse';
import { buildApiPaginatedResponse } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import {
  CreateRawMaterialCategorySchema,
  RawMaterialCategoryFiltersSchema,
  UpdateRawMaterialCategorySchema,
} from '../validators/raw-material-category.validators';
import { rawMaterialCategoryUseCases } from '../../infrastructure/container/rawMaterialCategoryContainer';

export const listRawMaterialCategories = async (req: Request, res: Response) => {
  const filters = parseDto(RawMaterialCategoryFiltersSchema, req.query);
  const result = await rawMaterialCategoryUseCases.getCategories.execute(filters);
  const response = buildApiPaginatedResponse(
    result.data,
    result.meta.total,
    result.meta.page || 1,
    result.meta.limit,
    result.meta.nextCursor
  );
  return ok(res, response);
};

export const getRawMaterialCategory = async (req: Request, res: Response) => {
  const category = await rawMaterialCategoryUseCases.getCategoryById.execute(req.params.id);
  if (!category) {
    return res.status(404).json({ success: false, error: 'not_found', message: 'Categoría de insumo no encontrada' });
  }
  return ok(res, category);
};

export const createRawMaterialCategory = async (req: Request, res: Response) => {
  const input = parseDto(CreateRawMaterialCategorySchema, req.body);
  const category = await rawMaterialCategoryUseCases.createCategory.execute(input);
  return created(res, category, 'Categoría de insumo creada');
};

export const updateRawMaterialCategory = async (req: Request, res: Response) => {
  const changes = parseDto(UpdateRawMaterialCategorySchema, req.body);
  const category = await rawMaterialCategoryUseCases.updateCategory.execute(req.params.id, changes);
  return ok(res, category, 'Categoría de insumo actualizada');
};

export const deleteRawMaterialCategory = async (req: Request, res: Response) => {
  await rawMaterialCategoryUseCases.deleteCategory.execute(req.params.id);
  return noContent(res);
};
