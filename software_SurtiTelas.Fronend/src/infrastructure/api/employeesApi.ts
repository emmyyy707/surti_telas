import { api, ApiError } from './httpClient';
import type { PaginatedResponse } from './pagination';

export type EmployeeRole = 'ASESOR' | 'DOMICILIARIO';
export type EmployeeEstado = 'ACTIVO' | 'INACTIVO';

export interface EmployeeProfile {
  cargo?: string | null;
  fechaContratacion?: string | null;
  salario?: number | null;
  tipoEmpleado?: EmployeeRole | null;
}

export interface Empleado {
  id: string;
  email: string;
  nombre: string;
  apellidos?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  role: EmployeeRole;
  estado: EmployeeEstado;
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
  profile?: EmployeeProfile;
}

export interface CreateEmpleadoInput {
  email: string;
  nombre: string;
  apellidos?: string;
  password: string;
  role: EmployeeRole;
  telefono?: string;
  direccion?: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  profile?: EmployeeProfile;
  domiciliaryData?: {
    zona?: string;
    vehiculo?: string;
    capacidad?: number;
  };
}

export interface UpdateEmpleadoInput {
  nombre?: string;
  apellidos?: string;
  email?: string;
  telefono?: string | null;
  direccion?: string | null;
  tipoDocumento?: string | null;
  numeroDocumento?: string | null;
  avatar?: string | null;
  profile?: EmployeeProfile;
  domiciliaryData?: {
    zona?: string;
    vehiculo?: string;
    capacidad?: number;
    activo?: boolean;
  };
}

export interface EmpleadosListResult {
  items: Empleado[];
  meta: PaginatedResponse<Empleado>['data']['meta'];
}

export interface RolDisponible {
  id: string;
  role: string;
  nombre: string;
  descripcion: string;
  estado: 'Activo' | 'Inactivo';
  permisos: string[];
  usuarios: number;
}

const errMsg = (e: unknown): string =>
  e instanceof ApiError ? e.message : 'Error de comunicación con el servidor';

export const employeesApi = {
  list(query?: Record<string, string | number | boolean | undefined | null>): Promise<EmpleadosListResult> {
    return api
      .get<{ items: Empleado[]; meta: PaginatedResponse<Empleado>['data']['meta'] } | undefined>('/employees', { query })
      .then((response) => {
        const items = response?.items ?? [];
        const meta = response?.meta ?? {
          totalRecords: 0,
          page: 1,
          limit: 50,
          totalPages: 0,
          nextCursor: undefined,
        };
        return { items, meta };
      })
      .catch((e) => {
        throw new ApiError(errMsg(e), 0);
      });
  },

  get(id: string): Promise<Empleado> {
    return api.get<Empleado>(`/employees/${encodeURIComponent(id)}`);
  },

  search(q: string): Promise<Empleado[]> {
    return api.get<Empleado[]>(`/employees/search`, { query: { q } });
  },

  create(data: CreateEmpleadoInput): Promise<Empleado> {
    return api.post<Empleado>('/employees', data);
  },

  update(id: string, changes: UpdateEmpleadoInput): Promise<Empleado> {
    return api.patch<Empleado>(`/employees/${encodeURIComponent(id)}`, changes);
  },

  changeStatus(id: string, estado: EmployeeEstado): Promise<Empleado> {
    return api.patch<Empleado>(`/employees/${encodeURIComponent(id)}/status`, { estado });
  },

  remove(id: string): Promise<void> {
    return api.delete<void>(`/employees/${encodeURIComponent(id)}`);
  },

  listRoles(): Promise<RolDisponible[]> {
    return api.get<RolDisponible[]>('/employees/roles');
  },
};

export default employeesApi;
