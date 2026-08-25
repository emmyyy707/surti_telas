import type { Employee, EmployeeRole, EmployeeEstado, EmployeeProfileData } from '../entities/Employee';

export interface EmployeeFilters {
  search?: string;
  role?: EmployeeRole;
  estado?: EmployeeEstado;
  page?: number;
  limit?: number;
  sort?: 'nombre' | 'email' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface CreateEmployeeInput {
  email: string;
  nombre: string;
  apellidos?: string;
  password: string;
  role: EmployeeRole;
  telefono?: string;
  direccion?: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  profile?: EmployeeProfileData;
}

export interface UpdateEmployeeInput {
  nombre?: string;
  apellidos?: string;
  email?: string;
  telefono?: string | null;
  direccion?: string | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  avatar?: string | null;
  profile?: EmployeeProfileData;
}

export interface EmployeeRepository {
  list(filters?: EmployeeFilters): Promise<{ data: Employee[]; meta: { total: number; page: number; limit: number; nextCursor?: string } }>;
  getById(id: string): Promise<Employee | null>;
  search(query: string): Promise<Employee[]>;
  create(data: CreateEmployeeInput): Promise<Employee>;
  update(id: string, changes: UpdateEmployeeInput): Promise<Employee>;
  changeStatus(id: string, estado: EmployeeEstado): Promise<Employee>;
  delete(id: string): Promise<void>;
}

export interface RoleConfigData {
  id: string;
  role: string;
  nombre: string;
  descripcion: string;
  estado: 'Activo' | 'Inactivo';
  permisos: string[];
  usuarios: number;
}

export interface RoleRepository {
  listAvailableRoles(): Promise<RoleConfigData[]>;
}
