import { Request, Response } from 'express';
import { ok, created, noContent } from '../../../../shared/presentation/http/HttpResponse';
import { buildApiPaginatedResponse } from '../../../../shared/presentation/http/PaginatedResponse';
import { parseDto } from '../../../../shared/presentation/http/validate';
import { employeeUseCases } from '../../infrastructure/container/employeeContainer';
import { EmployeeFiltersSchema, CreateEmployeeSchema, UpdateEmployeeSchema, ChangeEmployeeStatusSchema, EmployeeSearchSchema } from '../validators/employee.validators';

export const listEmployees = async (req: Request, res: Response) => {
  const filters = parseDto(EmployeeFiltersSchema, req.query);
  const result = await employeeUseCases.listEmployees.execute(filters);
  const response = buildApiPaginatedResponse(
    result.data,
    result.meta.total,
    result.meta.page,
    result.meta.limit,
    result.meta.nextCursor
  );
  return ok(res, response);
};

export const searchEmployees = async (req: Request, res: Response) => {
  const { q } = parseDto(EmployeeSearchSchema, { q: req.query.q });
  const employees = await employeeUseCases.searchEmployees.execute(q);
  return ok(res, employees);
};

export const getEmployee = async (req: Request, res: Response) => {
  const employee = await employeeUseCases.getEmployee.execute(req.params.id);
  if (!employee) {
    return res.status(404).json({ success: false, error: 'not_found', message: 'Empleado no encontrado' });
  }
  return ok(res, employee);
};

export const createEmployee = async (req: Request, res: Response) => {
  const input = parseDto(CreateEmployeeSchema, req.body);
  const employee = await employeeUseCases.createEmployee.execute(input);
  return created(res, employee, 'Empleado creado');
};

export const updateEmployee = async (req: Request, res: Response) => {
  const { id } = req.params;
  const changes = parseDto(UpdateEmployeeSchema, req.body);
  const employee = await employeeUseCases.updateEmployee.execute(id, changes);
  return ok(res, employee, 'Empleado actualizado');
};

export const changeEmployeeStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { estado } = parseDto(ChangeEmployeeStatusSchema, req.body);
  const normalizedEstado = estado.toUpperCase() as 'ACTIVO' | 'INACTIVO';
  const employee = await employeeUseCases.changeEmployeeStatus.execute(id, normalizedEstado);
  return ok(res, employee, normalizedEstado === 'ACTIVO' ? 'Empleado activado' : 'Empleado desactivado');
};

export const deleteEmployee = async (req: Request, res: Response) => {
  await employeeUseCases.deleteEmployee.execute(req.params.id);
  return noContent(res);
};

export const listAvailableRoles = async (_req: Request, res: Response) => {
  const roles = await employeeUseCases.listAvailableRoles.execute();
  return ok(res, roles);
};
