import type { Customer, CustomerStatus } from '../entities/Customer';

export interface CreateCustomerInput {
  nombre: string;
  ciudad?: string;
  tel?: string;
  asesorId?: string;
  nit?: string;
  cupoTotal?: number;
  cupoUsado?: number;
  deudaVencida?: number;
  isTrustedCustomer?: boolean;
  estado?: CustomerStatus;
}

export interface UpdateCustomerInput {
  nombre?: string;
  ciudad?: string;
  tel?: string;
  nit?: string;
  cupoTotal?: number;
  cupoUsado?: number;
  deudaVencida?: number;
  isTrustedCustomer?: boolean;
  estado?: CustomerStatus;
  asesorId?: string;
}

export interface CustomerFilters {
  search?: string;
  asesorId?: string;
  estado?: CustomerStatus;
  page?: number;
  limit?: number;
  cursor?: string;
  sort?: 'nombre' | 'ciudad' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface CustomerRepository {
  list(filters?: CustomerFilters): Promise<{ data: Customer[]; meta: { total: number; page?: number; limit: number; nextCursor?: string } }>;
  getById(id: string): Promise<Customer | null>;
  create(input: CreateCustomerInput): Promise<Customer>;
  update(id: string, changes: UpdateCustomerInput): Promise<Customer>;
  assignAsesor(id: string, asesorId: string): Promise<Customer>;
  updateCupo(id: string, cupoTotal?: number, cupoUsado?: number, deudaVencida?: number): Promise<Customer>;
  delete(id: string): Promise<void>;
}
