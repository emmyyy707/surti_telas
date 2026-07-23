import type { CompanyConfig } from '../entities/CompanyConfig';

export interface UpdateCompanyConfigInput {
  nombre?: string;
  nit?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  logo?: string;
  moneda?: string;
}

export interface CompanyConfigRepository {
  getCompany(): Promise<CompanyConfig | null>;
  update(input: UpdateCompanyConfigInput): Promise<CompanyConfig>;
}
