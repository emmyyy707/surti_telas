import { Request, Response } from 'express';
import { ok, created, noContent } from '../../../../shared/presentation/http/HttpResponse';
import { buildHateoasLinks, buildPaginationMeta } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { customerUseCases } from '../../infrastructure/container/customerContainer';
import {
  AssignAsesorSchema,
  CreateCustomerSchema,
  CustomerFiltersSchema,
  UpdateCupoSchema,
  UpdateCustomerSchema,
} from '../validators/customer.validators';

export const listCustomers = async (req: Request, res: Response) => {
  const filters = parseDto(CustomerFiltersSchema, req.query);
  const result = await customerUseCases.getCustomers.execute(filters);
  const meta = buildPaginationMeta(
    result.meta.total,
    result.meta.page || 1,
    result.meta.limit,
    req.originalUrl,
    { search: filters.search, asesorId: filters.asesorId, estado: filters.estado, sort: filters.sort, order: filters.order, cursor: filters.cursor },
    result.meta.nextCursor
  );
  return ok(res, { items: result.data, meta });
};

export const getCustomer = async (req: Request, res: Response) => {
  const customer = await customerUseCases.getCustomerById.execute(req.params.id);
  const hateoas = buildHateoasLinks('/api/v1/customers', customer.id);
  return ok(res, { ...customer, _links: hateoas });
};

export const createCustomer = async (req: Request, res: Response) => {
  const input = parseDto(CreateCustomerSchema, req.body);
  const customer = await customerUseCases.createCustomer.execute(input);
  return created(res, customer, 'Cliente creado');
};

export const updateCustomer = async (req: Request, res: Response) => {
  const changes = parseDto(UpdateCustomerSchema, req.body);
  const customer = await customerUseCases.updateCustomer.execute(req.params.id, changes);
  return ok(res, customer, 'Cliente actualizado');
};

export const assignAsesor = async (req: Request, res: Response) => {
  const { asesorId } = parseDto(AssignAsesorSchema, req.body);
  const customer = await customerUseCases.assignAsesor.execute(req.params.id, asesorId);
  return ok(res, customer, 'Asesor asignado');
};

export const updateCupo = async (req: Request, res: Response) => {
  const { cupoTotal, cupoUsado } = parseDto(UpdateCupoSchema, req.body);
  const customer = await customerUseCases.updateCupo.execute(req.params.id, cupoTotal, cupoUsado);
  return ok(res, customer, 'Cupo actualizado');
};

export const deleteCustomer = async (req: Request, res: Response) => {
  await customerUseCases.deleteCustomer.execute(req.params.id);
  return noContent(res);
};
