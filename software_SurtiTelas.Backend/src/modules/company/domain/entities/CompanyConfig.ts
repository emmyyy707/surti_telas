export interface CompanyConfigData {
  id?: string;
  nombre: string;
  nit?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  logo?: string;
  moneda: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CompanyConfig {
  readonly id?: string;
  readonly nombre: string;
  readonly nit?: string;
  readonly telefono?: string;
  readonly email?: string;
  readonly direccion?: string;
  readonly ciudad?: string;
  readonly logo?: string;
  readonly moneda: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(data: CompanyConfigData) {
    CompanyConfig.validate(data);
    this.id = data.id;
    this.nombre = data.nombre;
    this.nit = data.nit;
    this.telefono = data.telefono;
    this.email = data.email;
    this.direccion = data.direccion;
    this.ciudad = data.ciudad;
    this.logo = data.logo;
    this.moneda = data.moneda;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static validate(data: CompanyConfigData): void {
    if (!data.nombre.trim()) {
      throw new Error('El nombre de la empresa es obligatorio');
    }
  }
}
