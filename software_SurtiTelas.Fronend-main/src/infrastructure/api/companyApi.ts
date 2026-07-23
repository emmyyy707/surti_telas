import { api } from './httpClient';

export interface CompanyConfig {
  id?: string;
  nombre: string;
  nit?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  logo?: string;
  moneda: string;
  createdAt?: string;
  updatedAt?: string;
}

export const companyApi = {
  async get(): Promise<CompanyConfig> {
    return api.get<CompanyConfig>('/company', { auth: false });
  },

  async update(data: Partial<CompanyConfig>): Promise<CompanyConfig> {
    return api.patch<CompanyConfig>('/company', data);
  },
};
