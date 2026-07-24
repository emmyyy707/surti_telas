import { Request, Response } from 'express';
import { ok, created, noContent } from '../../../../shared/presentation/http/HttpResponse';
import { buildApiPaginatedResponse } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { stockUseCases } from '../../infrastructure/container/stockContainer';
import {
  CreateRawMaterialSchema,
  CreateSupplierSchema,
  MovementFiltersSchema,
  RawMaterialFiltersSchema,
  RegisterMovementSchema,
  SupplierFiltersSchema,
  UpdateRawMaterialSchema,
  UpdateSupplierSchema,
} from '../validators/stock.validators';

export const listSuppliers = async (req: Request, res: Response) => {
  const filters = parseDto(SupplierFiltersSchema, req.query);
  const result = await stockUseCases.getSuppliers.execute(filters);
  const response = buildApiPaginatedResponse(
    result.data,
    result.meta.total,
    result.meta.page || 1,
    result.meta.limit,
    result.meta.nextCursor
  );
  return ok(res, response);
};

export const createSupplier = async (req: Request, res: Response) => {
  const input = parseDto(CreateSupplierSchema, req.body);
  const supplier = await stockUseCases.createSupplier.execute(input);
  return created(res, supplier, 'Proveedor creado');
};

export const getSupplier = async (req: Request, res: Response) => {
  const supplier = await stockUseCases.getSupplierById.execute(req.params.id);
  if (!supplier) {
    return res.status(404).json({ success: false, error: 'not_found', message: 'Proveedor no encontrado' });
  }
  return ok(res, supplier);
};

export const updateSupplier = async (req: Request, res: Response) => {
  const changes = parseDto(UpdateSupplierSchema, req.body);
  const supplier = await stockUseCases.updateSupplier.execute(req.params.id, changes);
  return ok(res, supplier, 'Proveedor actualizado');
};

export const deleteSupplier = async (req: Request, res: Response) => {
  await stockUseCases.deleteSupplier.execute(req.params.id);
  return noContent(res);
};

export const listRawMaterials = async (req: Request, res: Response) => {
  const filters = parseDto(RawMaterialFiltersSchema, req.query);
  const result = await stockUseCases.getRawMaterials.execute(filters);
  const response = buildApiPaginatedResponse(
    result.data,
    result.meta.total,
    result.meta.page || 1,
    result.meta.limit,
    result.meta.nextCursor
  );
  return ok(res, response);
};

export const createRawMaterial = async (req: Request, res: Response) => {
  const input = parseDto(CreateRawMaterialSchema, req.body);
  const material = await stockUseCases.createRawMaterial.execute(input);
  return created(res, material, 'Insumo creado');
};

export const updateRawMaterial = async (req: Request, res: Response) => {
  const changes = parseDto(UpdateRawMaterialSchema, req.body);
  const material = await stockUseCases.updateRawMaterial.execute(req.params.id, changes);
  return ok(res, material, 'Insumo actualizado');
};

export const deleteRawMaterial = async (req: Request, res: Response) => {
  await stockUseCases.deleteRawMaterial.execute(req.params.id);
  return noContent(res);
};

export const registerMovement = async (req: Request, res: Response) => {
  const input = parseDto(RegisterMovementSchema, req.body);
  const usuarioId = req.user!.id;
  const movement = await stockUseCases.registerMovement.execute({ ...input, usuarioId }, req.requestId);
  return created(res, movement, 'Movimiento registrado');
};

export const listMovements = async (req: Request, res: Response) => {
  const filters = parseDto(MovementFiltersSchema, req.query);
  const result = await stockUseCases.getMovements.execute(filters);
  const response = buildApiPaginatedResponse(
    result.data,
    result.meta.total,
    result.meta.page || 1,
    result.meta.limit,
    result.meta.nextCursor
  );
  return ok(res, response);
};

export const getStockAlerts = async (req: Request, res: Response) => {
  const filters = parseDto(RawMaterialFiltersSchema, req.query);
  const result = await stockUseCases.getStockAlerts.execute(filters);
  const response = buildApiPaginatedResponse(
    result.data,
    result.meta.total,
    result.meta.page || 1,
    result.meta.limit,
    result.meta.nextCursor
  );
  return ok(res, response);
};